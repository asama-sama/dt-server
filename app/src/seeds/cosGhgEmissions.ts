import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  await DataSource.findOrCreate({
    where: {
      name: DATASOURCES.cosGhgEmissions.name,
    },
    defaults: {
      name: DATASOURCES.cosGhgEmissions.name,
    },
  });
};
