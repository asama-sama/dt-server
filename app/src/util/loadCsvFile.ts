import fs from "fs";
import csv from "csv-parser";
import { getConnection } from "../db/connect";
import { Suburb } from "../db/models/Suburb";
// import { ProcessedDataFile } from "./db/models/ProcessedDataFile";
// import { bulkSearch } from "./clients/nominatim";
import { Transaction } from "sequelize";
import { DataFile } from "../db/models/DataFile";
import { DataSource } from "../db/models/DataSource";
import { DATASOURCES } from "../const/datasource";
import { CrimeCategory } from "../db/models/CrimeCategory";
import { CrimeIncident } from "../db/models/CrimeIncident";

type SuburbAttributes = {
  name: string;
  shapeArea: string;
  shapeLength: string;
};

export type LoadDataFileResult = {
  totalReads: number;
  nullReads: number;
};

type HandleProcessCsvFile = (
  results: Record<string, string>[],
  dataSource: DataFile,
  trx: Transaction
) => Promise<LoadDataFileResult>;

const handleAggregateEmissionData: HandleProcessCsvFile = async (
  results,
  dataSource,
  trx
) => {
  let nullReads = 0;
  let totalReads = 0;
  const uniqueSuburbs = new Set<string>();
  for (const result of results) {
    // build up normalised tables
    const suburbData: SuburbAttributes = {
      name: result["Area_suburb"],
      shapeArea: result["Shape__Area"],
      shapeLength: result["Shape__Length"],
    };
    const categoryData = {
      name: result["Data_Category"],
    };

    uniqueSuburbs.add(result["Area_suburb"]);
    const suburbCreated = await Suburb.findOrCreate({
      where: {
        name: suburbData.name,
      },
      defaults: {
        name: suburbData.name,
        shapeArea: parseFloat(suburbData.shapeArea),
        shapeLength: parseFloat(suburbData.shapeLength),
      },
      transaction: trx,
    });
    // const categoryCreated = await Category.findOrCreate({
    //   where: {
    //     name: categoryData.name,
    //   },
    //   defaults: {
    //     name: categoryData.name,
    //   },
    //   transaction: t,
    // });

    // get table relation
    const suburb = suburbCreated[0];
    // const category = categoryCreated[0];

    // insert emission values
    const properties = Object.keys(result);
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const yearMatch = property.match(/^F\d{4}_\d{2}/g);
      if (yearMatch) {
        const readingValue = parseFloat(result[property]);
        let reading;
        if (isNaN(readingValue)) {
          nullReads += 1;
          reading = null;
        } else {
          reading = readingValue;
        }
        const year = parseInt(yearMatch[0].substring(1, 5));
        try {
          // await Emission.create(
          //   {
          //     year: year,
          //     reading,
          //     suburbId: suburb.id,
          //     categoryId: category.id,
          //   },
          //   { transaction: trx }
          // );
          totalReads += 1;
        } catch (e) {
          console.error("Error inserting emission", e);
        }
      }
    }
  }
  return {
    totalReads,
    nullReads,
  };
};

export const handleCrimeData: HandleProcessCsvFile = async (
  results,
  dataFile,
  trx
) => {
  const totalReads = 0,
    nullReads = 0;

  const suburbMap: { [key: string]: Suburb } = {};
  const crimeCategoryMap: { [key: string]: { [key: string]: CrimeCategory } } =
    {};

  for (const result of results) {
    const suburbName = result["LGA"];

    let suburb: Suburb = suburbMap[suburbName];
    if (!suburb) {
      [suburb] = await Suburb.findOrCreate({
        where: {
          name: suburbName.toUpperCase(),
        },
      });
      suburbMap[suburbName] = suburb;
    }

    const categoryName = result["Offence category"];
    const subcategoryName = result["Subcategory"];

    if (!crimeCategoryMap[categoryName]) {
      crimeCategoryMap[categoryName] = {};
    }
    let crimeCategory = crimeCategoryMap[categoryName][subcategoryName];
    if (!crimeCategory) {
      [crimeCategory] = await CrimeCategory.findOrCreate({
        where: {
          Category: categoryName,
          Subcategory: subcategoryName,
        },
      });
      crimeCategoryMap[categoryName][subcategoryName] = crimeCategory;
    }

    const headers = Object.keys(result);
    for (const header of headers) {
      if (
        header === "LGA" ||
        header === "Offence category" ||
        header === "Subcategory"
      )
        continue;

      const date = new Date(header);
      const month = date.getMonth();
      const year = date.getFullYear();

      await CrimeIncident.findOrCreate({
        where: {
          year,
          month,
          crimeCategoryId: crimeCategory.id,
          suburbId: suburb.id,
        },
        defaults: {
          year,
          month,
          value: result[header],
          crimeCategoryId: crimeCategory.id,
          suburbId: suburb.id,
          dataFileId: dataFile.id,
        },
        transaction: trx,
      });
    }
  }

  return { totalReads, nullReads };
};

const dataFileHandlerMap: { [key: string]: HandleProcessCsvFile } = {
  [DATASOURCES.nswCrimeBySuburb.name]: handleCrimeData,
};

export const loadDataFile = async (dataFile: DataFile) => {
  const { DATA_FILES_PATH } = process.env;
  if (!DATA_FILES_PATH) throw new Error("Must provide path to data files");

  const sequelize = getConnection();
  const promise = new Promise<LoadDataFileResult>((resolve, reject) => {
    const loadFileResult = { nullReads: 0, totalReads: 0 };
    const results: Record<string, string>[] = [];
    fs.createReadStream(`${DATA_FILES_PATH}/${dataFile.name}`)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          sequelize.transaction(async (t: Transaction) => {
            const handler = dataFileHandlerMap[dataFile.dataSource.name];
            handler(results, dataFile, t);
            await dataFile.update(
              {
                processed: true,
              },
              {
                transaction: t,
              }
            );
            resolve(loadFileResult);
          });
        } catch (e) {
          reject(e);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
  return promise;
};

export const loadCsvFiles = async () => {
  const filesToProcess = await DataFile.findAll({
    where: { processed: false },
    include: { model: DataSource, as: "dataSource" },
  });

  filesToProcess.forEach(async (fileToProcess) => {
    try {
      await loadDataFile(fileToProcess);
    } catch (e) {
      console.error(e);
    }
  });
};
