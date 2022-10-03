import { APIS } from "../const/api";
import { Api } from "../db/models/Api";

export const seed = async () => {
  await Api.create({
    name: APIS.nswTrafficVolumeStations.name,
    uri: APIS.nswTrafficVolumeStations.uri,
    queryStringParams: APIS.nswTrafficVolumeStations.queryStringParams,
  });
};
