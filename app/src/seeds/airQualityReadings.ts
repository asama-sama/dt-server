import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";
import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";

export const seed = async () => {
  const nswAirQualityReadingsApi = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswAirQualityReadings.name,
    },
  });
  if (!nswAirQualityReadingsApi) {
    await DataSource.create({
      name: DATASOURCES.nswAirQualityReadings.name,
      uri: DATASOURCES.nswAirQualityReadings.uri,
      queryStringParams: DATASOURCES.nswAirQualityReadings.queryStringParams,
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
