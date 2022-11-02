import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";

export const loadDataSources = async () => {
  for (const dataSourceKey in DATASOURCES) {
    await DataSource.findOrCreate({
      where: { name: DATASOURCES[dataSourceKey].name },
    });
  } // run each time if new datasources are added
};
