import { DataSource } from "../db/models/DataSource";
import { DATASOURCES } from "../const/datasource";

export const seedTypes = async () => {
  await DataSource.create({
    name: DATASOURCES.bomSites.name,
  });

  await DataSource.create({
    name: DATASOURCES.bomReadings.name,
  });
};
