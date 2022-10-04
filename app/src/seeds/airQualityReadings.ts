import { APIS } from "../const/api";
import { Api } from "../db/models/Api";
import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";

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
