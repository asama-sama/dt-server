import { Api } from "../db/models/Api";
import { APIS } from "../const/api";

export const loadAndSync = async () => {
  const nswTrafficVolumeReadingsApi = await Api.findOne({
    where: {
      name: APIS.nswTrafficVolumeReadings.name,
    },
  });
  if (!nswTrafficVolumeReadingsApi) {
    await Api.create({
      where: {
        name: APIS.nswTrafficVolumeReadings.name,
        uri: APIS.nswTrafficVolumeReadings.uri,
        queryStringParams: APIS.nswTrafficVolumeReadings.queryStringParams,
      },
    });
  }
  const nswTrafficVolumeStationsApi = await Api.findOne({
    where: {
      name: APIS.nswTrafficVolumeStations.name,
    },
  });
  if (!nswTrafficVolumeStationsApi) {
    await Api.create({
      where: {
        name: APIS.nswTrafficVolumeStations.name,
        uri: APIS.nswTrafficVolumeStations.uri,
        queryStringParams: APIS.nswTrafficVolumeStations.queryStringParams,
      },
    });
  }
};
