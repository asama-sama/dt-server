import fs from "fs";
import csv from "csv-parser";
import { Emission } from "./db/models/Emission";
import { Category } from "./db/models/Category";
import { Suburb } from "./db/models/Suburb";
import { ModelStatic } from "./db/connect";

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
          // build up normalised tables
          results.forEach(async (result) => {
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
            const suburb = suburbCreated[0];

            const categoryCreated = await Category.findOrCreate({
              where: {
                name: categoryData.name,
              },
            });
            const category = categoryCreated[0];
          });
        });
    });
  });
};

export { loadDataFiles };
