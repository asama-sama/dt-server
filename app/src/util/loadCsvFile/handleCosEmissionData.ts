import { CosGhgCategory } from "../../db/models/CosGhgCategory";
import { CosGhgEmission } from "../../db/models/CosGhgEmission";
import { Suburb } from "../../db/models/Suburb";
import { HandleProcessCsvFile } from "./loadCsvFile";

type SuburbAttributes = {
  name: string;
};

export const handleCosEmissionData: HandleProcessCsvFile = async (
  results,
  dataFile,
  trx
) => {
  let nullReads = 0;
  let totalReads = 0;
  const uniqueSuburbs = new Set<string>();
  for (const result of results) {
    // build up normalised tables
    const suburbData: SuburbAttributes = {
      name: result["Area_suburb"],
    };
    const categoryData = {
      name: result["Data_Category"],
    };

    uniqueSuburbs.add(result["Area_suburb"]);
    const [suburb] = await Suburb.findOrCreate({
      where: {
        name: suburbData.name,
      },
      transaction: trx,
    });
    const [category] = await CosGhgCategory.findOrCreate({
      where: {
        name: categoryData.name,
      },
      defaults: {
        name: categoryData.name,
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
          await CosGhgEmission.create(
            {
              year: year,
              reading,
              suburbId: suburb.id,
              categoryId: category.id,
              dataFileId: dataFile.id,
            },
            { transaction: trx }
          );
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
