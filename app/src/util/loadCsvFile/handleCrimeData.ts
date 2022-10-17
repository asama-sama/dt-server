import { InferAttributes } from "sequelize";
import { CrimeCategory } from "../../db/models/CrimeCategory";
import { CrimeIncident } from "../../db/models/CrimeIncident";
import { Suburb } from "../../db/models/Suburb";
import { createLoadIndicator, markLoaded } from "../loader";
import { HandleProcessCsvFile } from "./loadCsvFile";

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
