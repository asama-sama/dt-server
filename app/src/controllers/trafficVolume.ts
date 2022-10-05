import { Op } from "sequelize";
import {
  getStationCountsByMonth,
  getStations,
} from "../clients/nswTrafficVolume";
import { APIS } from "../const/api";
import { DataSource } from "../db/models/DataSource";
import { TrafficVolumeReading } from "../db/models/TrafficVolumeReading";
import { TrafficVolumeStation } from "../db/models/TrafficVolumeStation";
import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";

export const updateStations = async () => {
  const stations = await getStations();
  const api = await DataSource.findOne({
    where: {
      name: APIS.nswTrafficVolumeStations.name,
    },
  });
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i];
    await TrafficVolumeStation.findOrCreate({
      where: {
        [Op.or]: [
          { stationId: station.station_id },
          { stationKey: station.station_key },
        ],
      },
      defaults: {
        dataSourceId: api?.id,
        stationKey: station.station_key,
        stationId: station.station_id,
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

export const updateReadings = async () => {
  const trafficVolumeStationsKeys = (
    await TrafficVolumeStation.findAll({
      attributes: ["stationKey"],
    })
  ).map((trafficVolumeStation) => trafficVolumeStation.stationKey);

  const api = await DataSource.findOne({
    where: { name: APIS.nswTrafficVolumeReadings.name },
  });

  const counts = await getStationCountsByMonth(trafficVolumeStationsKeys);
  const updateFrequency = await UpdateFrequency.findOne({
    where: { frequency: Frequency.MONTHLY },
  });

  const trafficVolumeStationsMap: { [key: string]: TrafficVolumeStation } = {};

  for (let i = 0; i < counts.length; i++) {
    const count = counts[i];
    let station: TrafficVolumeStation | null =
      trafficVolumeStationsMap[count.stationKey];
    if (!station) {
      station = await TrafficVolumeStation.findOne({
        where: {
          stationKey: count.stationKey,
        },
      });
      if (!station) throw new Error(`Station ${count.stationKey} not found`);
      trafficVolumeStationsMap[station.stationKey] = station;
    }
    await TrafficVolumeReading.findOrCreate({
      where: {
        trafficVolumeStationId: station.id,
        year: count.year,
        month: count.month,
      },
      defaults: {
        trafficVolumeStationId: station.id,
        year: count.year,
        month: count.month,
        value: count.count,
        dataSourceId: api?.id,
        updateFrequencyId: updateFrequency?.id,
      },
    });
  }
};
