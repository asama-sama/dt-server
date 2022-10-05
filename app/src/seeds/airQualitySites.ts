import { APIS } from "../const/api";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  const nswAirQualitySitesApi = await DataSource.findOne({
    where: {
      name: APIS.nswAirQualitySites.name,
    },
  });
  if (!nswAirQualitySitesApi) {
    await DataSource.create({
      name: APIS.nswAirQualitySites.name,
      uri: APIS.nswAirQualitySites.uri,
      queryStringParams: APIS.nswAirQualitySites.queryStringParams,
    });
  }
};
