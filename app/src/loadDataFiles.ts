import fs from "fs";
import csv from "csv-parser";
import { getConnection } from "./db/connect";
import { Emission } from "./db/models/Emission";
import { Category } from "./db/models/Category";
import { Suburb } from "./db/models/Suburb";
import { ProcessedDataFile } from "./db/models/ProcessedDataFile";
import { bulkSearch } from "./clients/nominatim";

type SuburbAttributes = {
  name: string;
  shapeArea: string;
  shapeLength: string;
};

export type LoadDataFileResult = {
  totalReads: number;
  nullReads: number;
};

export const loadDataFile = async (filename: string, path: string) => {
  const sequelize = getConnection();
  const promise = new Promise<LoadDataFileResult>((resolve, reject) => {
    let nullReads = 0,
      totalReads = 0;
    const uniqueSuburbs = new Set<string>();
    const results: Record<string, string>[] = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          sequelize.transaction(async (t) => {
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
                transaction: t,
              });
              const categoryCreated = await Category.findOrCreate({
                where: {
                  name: categoryData.name,
                },
                defaults: {
                  name: categoryData.name,
                },
                transaction: t,
              });

              // get table relation
              const suburb = suburbCreated[0];
              const category = categoryCreated[0];

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
                    await Emission.create(
                      {
                        year: year,
                        reading,
                        suburbId: suburb.id,
                        categoryId: category.id,
                      },
                      { transaction: t }
                    );
                    totalReads += 1;
                  } catch (e) {
                    console.error("Error inserting emission", e);
                  }
                }
              }
            }
            await ProcessedDataFile.create(
              {
                name: filename,
              },
              { transaction: t }
            );
            resolve({ totalReads, nullReads });
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

export const updateSuburbGeoJson = async () => {
  const suburbs = await Suburb.findAll({
    where: {
      geoData: null,
    },
  });
  const suburbMapping: { [key: string]: Suburb } = {};
  const suburbKeyNameMapping: { [key: string]: string } = {};
  const uniqueSuburbNamesSet = new Set<string>();

  for (const suburb of suburbs) {
    suburbMapping[suburb.name] = suburb;
    const suburbNames = suburb.name.split("+");
    for (const suburbName of suburbNames) {
      const name = suburbName.trim();
      suburbKeyNameMapping[name] = suburb.name;
      uniqueSuburbNamesSet.add(name);
    }
  }
  const uniqueSuburbNames = [...uniqueSuburbNamesSet];
  const searchResults = await bulkSearch(uniqueSuburbNames);
  for (let i = 0; i < searchResults.length; i++) {
    const suburbName = uniqueSuburbNames[i];
    const suburbKey = suburbKeyNameMapping[suburbName];
    const suburb = suburbMapping[suburbKey];
    // for suburbs that span two suburbs ie. with +, make sure to keep data for both
    await suburb.reload();
    await suburb.update({
      geoData: {
        ...suburb.geoData,
        [suburbName]: searchResults[i],
      },
    });
  }
};

export const loadDataFiles = async () => {
  const { DATA_FILES_PATH } = process.env;
  if (!DATA_FILES_PATH) throw new Error("Must provide path to data files");

  return new Promise((resolve, reject) => {
    fs.readdir(DATA_FILES_PATH, async (err, files) => {
      for (const file of files) {
        const foundFile = await ProcessedDataFile.findOne({
          where: { name: file },
        });

        if (foundFile) {
          continue;
        }
        const path = `${DATA_FILES_PATH}/${file}`;
        try {
          await loadDataFile(file, path);
        } catch (err) {
          console.error(err);
          reject(err);
        }
      }
      await updateSuburbGeoJson();
      resolve(null);
    });
  });
};
