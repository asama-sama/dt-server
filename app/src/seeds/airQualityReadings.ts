import { APIS } from "../const/api";
import { Api } from "../db/models/Api";
import {
  Frequency,
  AirQualityReadingFrequency,
} from "../db/models/AirQualityReadingFrequency";

export const seed = async () => {
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
};
