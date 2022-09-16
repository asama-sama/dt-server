import { Api } from "../db/models/Api";
import { APIS, API_UPDATE_MS } from "../const/api";
import { updateSites } from "../controllers/airQuality";

const setupDb = async () => {
  const nswAirQualityReadingsApi = await Api.findOne({
    where: {
      name: APIS.nswAirQualityReadings.name,
    },
  });
  if (!nswAirQualityReadingsApi) {
    await Api.create({
      name: APIS.nswAirQualityReadings.name,
      uri: APIS.nswAirQualityReadings.uri,
      queryStringParams: APIS.nswAirQualityReadings.queryStringParams,
    });
  }
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

const setupUpdates = async () => {
  setInterval(() => updateSites(), API_UPDATE_MS);
};

export const init = async () => {
  await setupDb();
};
