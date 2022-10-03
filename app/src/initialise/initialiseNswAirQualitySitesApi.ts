import { Api } from "../db/models/Api";
import { APIS } from "../const/api";
import { updateSites } from "../controllers/airQuality";

export const initialiseNswAirQualitySitesApi = {
  async setupDb() {
    // const nswAirQualityReadingsApi = await Api.findOne({
    //   where: {
    //     name: APIS.nswAirQualityReadings.name,
    //   },
    // });
    // if (!nswAirQualityReadingsApi) {
    //   await Api.create({
    //     name: APIS.nswAirQualityReadings.name,
    //     uri: APIS.nswAirQualityReadings.uri,
    //     queryStringParams: APIS.nswAirQualityReadings.queryStringParams,
    //   });
    // }
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
  },

  async update() {
    const api = await Api.findOne({
      where: { name: APIS.nswAirQualitySites.name },
    });
    const apiConsts = APIS.nswAirQualitySites;
    if (!api) throw new Error(`No api found for ${apiConsts.name}`);
    await updateSites(api);
  },

  apiConsts: APIS.nswAirQualitySites,
};
