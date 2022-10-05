import { APIS } from "../const/api";
import { DataSource } from "../db/models/DataSource";
import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";

export const seed = async () => {
  const nswAirQualityReadingsApi = await DataSource.findOne({
    where: {
      name: APIS.nswAirQualityReadings.name,
    },
  });
  if (!nswAirQualityReadingsApi) {
    await DataSource.create({
      name: APIS.nswAirQualityReadings.name,
      uri: APIS.nswAirQualityReadings.uri,
      queryStringParams: APIS.nswAirQualityReadings.queryStringParams,
    });
  }
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.HOURLY,
    },
  });
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.DAILY,
    },
  });
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.MONTHLY,
    },
  });
};
