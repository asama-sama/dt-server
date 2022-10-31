import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  const nswAirQualitySitesApi = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswAirQualitySites.name,
    },
  });
  if (!nswAirQualitySitesApi) {
    await DataSource.create({
      name: DATASOURCES.nswAirQualitySites.name,
    });
  }
};
