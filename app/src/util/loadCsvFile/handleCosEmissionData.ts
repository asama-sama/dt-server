import { CosGhgCategory } from "../../db/models/CosGhgCategory";
import { CosGhgEmission } from "../../db/models/CosGhgEmission";
import { Suburb } from "../../db/models/Suburb";
import { parseSuburbNames } from "../suburbUtils";
import { HandleProcessCsvFile } from "./loadCsvFile";

export const handleCosEmissionData: HandleProcessCsvFile = async (
  results,
  dataFile,
  trx
) => {
  let nullReads = 0,
    totalReads = 0;
  for (const result of results) {
    const categoryName = result["Data_Category"];

    const suburbNames = parseSuburbNames(result["Area_suburb"]);
    const suburbs: Suburb[] = [];
    for (let i = 0; i < suburbNames.length; i++) {
      const [suburb] = await Suburb.findOrCreate({
        where: {
          name: suburbNames[i].toUpperCase(),
        },
        transaction: trx,
      });
      suburbs.push(suburb);
    }
    const [category] = await CosGhgCategory.findOrCreate({
      where: {
        name: categoryName,
      },
      defaults: {
        name: categoryName,
      },
      transaction: trx,
    });

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
          for (let i = 0; i < suburbs.length; i++) {
            await CosGhgEmission.create(
              {
                year: year,
                reading,
                suburbId: suburbs[i].id,
                categoryId: category.id,
                dataFileId: dataFile.id,
              },
              { transaction: trx }
            );
            totalReads += 1;
          }
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
