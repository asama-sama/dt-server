import { APIS } from "../const/api";
import { updateDailyReadings } from "../controllers/airQuality";
import {
  AirQualityReadingFrequency,
  Frequency,
} from "../db/models/AirQualityReadingFrequency";
import { Api } from "../db/models/Api";

export const airQualityReadingsApi = {
  async setupDb() {
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
    await AirQualityReadingFrequency.findOrCreate({
      where: {
        frequency: Frequency.HOURLY,
      },
    });
    await AirQualityReadingFrequency.findOrCreate({
      where: {
        frequency: Frequency.DAILY,
      },
    });
    await AirQualityReadingFrequency.findOrCreate({
      where: {
        frequency: Frequency.MONTHLY,
      },
    });
  },
  async update() {
    const api = await Api.findOne({
      where: {
        name: APIS.nswAirQualityReadings.name,
      },
    });
    if (!api)
      throw new Error(`Could not find api ${APIS.nswAirQualityReadings.name}`);
    await updateDailyReadings(api, new Date());
  },
  apiConsts: APIS.nswAirQualityReadings,
};
