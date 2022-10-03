import { getStations } from "../clients/nswTrafficVolume";
import { APIS } from "../const/api";
import { Api } from "../db/models/Api";
import { TrafficVolumeStation } from "../db/models/TrafficVolumeStation";

export const updateStations = async () => {
  const stations = await getStations();
  const api = await Api.findOne({
    where: {
      name: APIS.nswTrafficVolumeStations.name,
    },
  });
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i];
    await TrafficVolumeStation.findOrCreate({
      where: {
        stationId: station.station_id,
      },
      defaults: {
        apiId: api?.id,
        stationKey: station.station_key,
        lat: station.latitude,
        lng: station.longitude,
        name: station.name,
        suburb: station.suburb,
        lga: station.lga,
        rmsRegion: station.rms_region,
        postCode: station.post_code,
      },
    });
  }
};
