import fs from "fs";
import csv from "csv-parser";
import { getConnection } from "./db/connect";
import { Emission } from "./db/models/Emission";
import { Category } from "./db/models/Category";
import { Suburb } from "./db/models/Suburb";
import { ProcessedDataFile } from "./db/models/ProcessedDataFile";

type SuburbAttributes = {
  name: string;
  shapeArea: string;
  shapeLength: string;
};

const loadFile = async (filename: string, path: string) => {
  const sequelize = await getConnection();
  const promise = new Promise((resolve, reject) => {
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
                  const year = parseInt(yearMatch[0].substring(1, 5));
                  try {
                    await Emission.create(
                      {
                        year: year,
                        reading: parseFloat(result[property]) || 0,
                        suburbId: suburb.id,
                        categoryId: category.id,
                      },
                      { transaction: t }
                    );
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
            resolve(`${filename} loaded successfully`);
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

const loadDataFiles = async () => {
  const { DATA_FILES_PATH } = process.env;

  if (!DATA_FILES_PATH) throw new Error("Must provide path to data files");

  fs.readdir(DATA_FILES_PATH, async (err, files) => {
    for (const file of files) {
      const foundFile = await ProcessedDataFile.findOne({
        where: { name: file },
      });

      if (foundFile) {
        console.log(`${file} has already been uploaded. Skipping`);
        continue;
      } else {
        console.log(`processing ${file}`);
      }
      console.log(foundFile);
      const path = `${DATA_FILES_PATH}/${file}`;
      try {
        await loadFile(file, path);
      } catch (err) {
        console.error(err);
      }
    }
  });
};

export { loadDataFiles };
