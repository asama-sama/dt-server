import { DataSource } from "../db/models/DataSource";
import { APIS } from "../const/api";

export const loadAndSync = async () => {
  const nswTrafficVolumeReadingsApi = await DataSource.findOne({
    where: {
      name: APIS.nswTrafficVolumeReadings.name,
    },
  });
  if (!nswTrafficVolumeReadingsApi) {
    await DataSource.create({
      name: APIS.nswTrafficVolumeReadings.name,
      uri: APIS.nswTrafficVolumeReadings.uri,
      queryStringParams: APIS.nswTrafficVolumeReadings.queryStringParams,
    });
  }
  const nswTrafficVolumeStationsApi = await DataSource.findOne({
    where: {
      name: APIS.nswTrafficVolumeStations.name,
    },
  });
  if (!nswTrafficVolumeStationsApi) {
    await DataSource.create({
      name: APIS.nswTrafficVolumeStations.name,
      uri: APIS.nswTrafficVolumeStations.uri,
      queryStringParams: APIS.nswTrafficVolumeStations.queryStringParams,
    });
  }
};
