import { APIS } from "../const/api";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  await DataSource.create({
    name: APIS.nswTrafficVolumeStations.name,
    uri: APIS.nswTrafficVolumeStations.uri,
    queryStringParams: APIS.nswTrafficVolumeStations.queryStringParams,
  });
};
