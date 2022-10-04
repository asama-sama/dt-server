import { APIS } from "../const/api";
import { Api } from "../db/models/Api";

export const seed = async () => {
  await Api.create({
    name: APIS.nswTrafficVolumeReadings.name,
    uri: APIS.nswTrafficVolumeReadings.uri,
    queryStringParams: APIS.nswTrafficVolumeReadings.queryStringParams,
  });
};
