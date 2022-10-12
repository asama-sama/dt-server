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
import { InferAttributes } from "sequelize";
import { createLoadIndicator, markLoaded } from "./loader";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../db/models/DataSourceUpdateLog";

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

type SplitUpCsvFile = (
  results: Record<string, string>[],
  chunkSize: number
) => Record<string, string>[][];

export const splitUpCsvFile: SplitUpCsvFile = (results, chunkSize) => {
  const csvChunks: Record<string, string>[][] = [];
  let startIdx = 0;
  let elementsRemaining = true;
  while (elementsRemaining) {
    const chunk = results.slice(startIdx, startIdx + chunkSize);
    if (chunk.length === 0) {
      elementsRemaining = false;
      break;
    }
    csvChunks.push(chunk);
    startIdx = startIdx + chunkSize;
  }
  return csvChunks;
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

  const crimeIncidentsToCreate: Omit<
    InferAttributes<CrimeIncident>,
    "suburb" | "dataFile" | "crimeCategory"
  >[] = [];

  const loadIndicator = createLoadIndicator();

  for (let i = 0; i < results.length; i++) {
    markLoaded(loadIndicator, i / results.length);
    const result = results[i];
    const suburbName = result["Suburb"];
    if (!suburbName) {
      console.error("No suburb name found");
      continue;
    }

    let suburb: Suburb = suburbMap[suburbName];
    if (!suburb) {
      [suburb] = await Suburb.findOrCreate({
        where: {
          name: suburbName.toUpperCase(),
        },
        transaction: trx,
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
        transaction: trx,
      });
      crimeCategoryMap[categoryName][subcategoryName] = crimeCategory;
    }
    const headers = Object.keys(result);
    for (const header of headers) {
      if (
        header === "Suburb" ||
        header === "Offence category" ||
        header === "Subcategory"
      )
        continue;

      const date = new Date(header);
      const month = date.getMonth();
      const year = date.getFullYear();

      crimeIncidentsToCreate.push({
        year,
        month,
        value: parseInt(result[header]),
        crimeCategoryId: crimeCategory.id,
        suburbId: suburb.id,
        dataFileId: dataFile.id,
      });
    }
  }
  await CrimeIncident.bulkCreate(crimeIncidentsToCreate, {
    transaction: trx,
  });

  return { totalReads, nullReads };
};

const dataFileHandlerMap: { [key: string]: HandleProcessCsvFile } = {
  [DATASOURCES.nswCrimeBySuburb.name]: handleCrimeData,
};

export const loadDataFile = async (dataFile: DataFile) => {
  if (dataFile.processed) {
    return Promise.reject(`${dataFile.name} has already been processed`);
  }
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
        const handler = dataFileHandlerMap[dataFile.dataSource.name];
        const CHUNK_SIZE = 25;
        const chunks = splitUpCsvFile(results, CHUNK_SIZE);

        //TODO: figure out why the connection pipe breaks and doesn't recover
        try {
          for (let i = 0; i < chunks.length; i++) {
            await sequelize.transaction(async (t: Transaction) => {
              const chunk = chunks[i];
              try {
                await sequelize.authenticate();
              } catch (e) {
                console.error("Could not connect");
                throw e;
              }
              await handler(chunk, dataFile, t);
              await DataSourceUpdateLog.create(
                {
                  dataSourceId: dataFile.dataSource.id,
                  status: UpdateStatus.SUCCESS,
                  message: `part ${i + 1}/${
                    chunks.length
                  }. Chunk size: ${CHUNK_SIZE}`,
                },
                { transaction: t }
              );
            });
          }
          await dataFile.update({
            processed: true,
            processedOn: new Date(),
          });
        } catch (e) {
          console.error(e);
          let message = "";
          if (e instanceof Error) {
            message = e.message;
          }
          await DataSourceUpdateLog.create({
            dataSourceId: dataFile.dataSource.id,
            status: UpdateStatus.FAIL,
            message,
          });
          reject(e);
        }
        resolve(loadFileResult);
      })
      .on("error", (err) => {
        console.error(err);
        reject(err);
      });
  });
  return promise;
};

export const loadCsvFiles = async () => {
  const filesToProcess = await DataFile.findAll({
    where: {
      processed: false,
    },
    include: { model: DataSource, as: "dataSource" },
  });
  for (const fileToProcess of filesToProcess) {
    try {
      await loadDataFile(fileToProcess);
    } catch (e) {
      console.error(e);
    }
  }
};
