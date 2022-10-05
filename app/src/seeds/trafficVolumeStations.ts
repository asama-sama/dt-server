import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  await DataSource.create({
    name: DATASOURCES.nswTrafficVolumeStations.name,
    uri: DATASOURCES.nswTrafficVolumeStations.uri,
    queryStringParams: DATASOURCES.nswTrafficVolumeStations.queryStringParams,
  });
};
