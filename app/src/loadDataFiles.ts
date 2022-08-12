import fs from "fs";
import csv from "csv-parser";
import { Emission } from "./db/models/Emission";
import { Category } from "./db/models/Category";
import { Suburb } from "./db/models/Suburb";

type SuburbAttributes = {
  name: string;
  shapeArea: string;
  shapeLength: string;
};

const loadDataFiles = () => {
  const { DATA_FILES_PATH } = process.env;

  if (!DATA_FILES_PATH) throw new Error("Must provide path to data files");

  fs.readdir(DATA_FILES_PATH, (err, files) => {
    files.forEach((file) => {
      const results: Record<string, string>[] = [];
      const path = `${DATA_FILES_PATH}/${file}`;
      console.log(path);
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          results.forEach(async (result) => {
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
            });

            const categoryCreated = await Category.findOrCreate({
              where: {
                name: categoryData.name,
              },
              defaults: {
                name: categoryData.name,
              },
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
                  await Emission.create({
                    year: year,
                    reading: result[property] || 0,
                    suburbId: suburb.id,
                    categoryId: category.id,
                  });
                } catch (e) {
                  console.error("Error inserting emission", e);
                }
              }
            }
          });
        });
    });
  });
};

export { loadDataFiles };
