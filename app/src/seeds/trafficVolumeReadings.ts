import { APIS } from "../const/api";
import { DataSource } from "../db/models/DataSource";

export const seed = async () => {
  await DataSource.create({
    name: APIS.nswTrafficVolumeReadings.name,
    uri: APIS.nswTrafficVolumeReadings.uri,
    queryStringParams: APIS.nswTrafficVolumeReadings.queryStringParams,
  });
};
