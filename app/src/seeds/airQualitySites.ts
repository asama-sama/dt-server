import { APIS } from "../const/api";
import { Api } from "../db/models/Api";

export const seed = async () => {
  const nswAirQualitySitesApi = await Api.findOne({
    where: {
      name: APIS.nswAirQualitySites.name,
    },
  });
  if (!nswAirQualitySitesApi) {
    await Api.create({
      name: APIS.nswAirQualitySites.name,
      uri: APIS.nswAirQualitySites.uri,
      queryStringParams: APIS.nswAirQualitySites.queryStringParams,
    });
  }
};
