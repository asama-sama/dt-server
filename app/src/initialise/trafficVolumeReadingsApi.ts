import { DataSource } from "../db/models/DataSource";
import { DATASOURCES } from "../const/datasource";

export const loadAndSync = async () => {
  const nswTrafficVolumeReadingsApi = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswTrafficVolumeReadings.name,
    },
  });
  if (!nswTrafficVolumeReadingsApi) {
    await DataSource.create({
      name: DATASOURCES.nswTrafficVolumeReadings.name,
      uri: DATASOURCES.nswTrafficVolumeReadings.uri,
      queryStringParams: DATASOURCES.nswTrafficVolumeReadings.queryStringParams,
    });
  }
  const nswTrafficVolumeStationsApi = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswTrafficVolumeStations.name,
    },
  });
  if (!nswTrafficVolumeStationsApi) {
    await DataSource.create({
      name: DATASOURCES.nswTrafficVolumeStations.name,
      uri: DATASOURCES.nswTrafficVolumeStations.uri,
      queryStringParams: DATASOURCES.nswTrafficVolumeStations.queryStringParams,
    });
  }
};
