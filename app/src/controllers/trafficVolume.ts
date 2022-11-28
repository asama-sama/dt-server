import { Op } from "sequelize";
import {
  getDailyStationCounts,
  getStations,
} from "../clients/nswTrafficVolume";
import { DATASOURCES } from "../const/datasource";
import { DataSource } from "../db/models/DataSource";
import { Suburb } from "../db/models/Suburb";
import { TrafficVolumeReading } from "../db/models/TrafficVolumeReading";
import { TrafficVolumeStation } from "../db/models/TrafficVolumeStation";
import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";
import { JobInitialisorOptions } from "../initialise/jobs";
import { Loader } from "../util/loader";
import { updateSuburbGeoJson } from "../util/suburbUtils";

const YEARS_TO_SEARCH_INITIALISE = 3;
const MONTHS_TO_SEARCH_INITIALISE = 1;

export const updateStations = async () => {
  const stations = await getStations();
  const api = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswTrafficVolumeStations.name,
    },
  });
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i];
    const suburbName = station.suburb.toUpperCase();
    const [suburb] = await Suburb.findOrCreate({
      where: {
        name: suburbName,
      },
    });

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
        position: {
          type: "Point",
          coordinates: [station.longitude, station.latitude],
        },
        name: station.name,
        suburbId: suburb.id,
        lga: station.lga,
        rmsRegion: station.rms_region,
        postCode: station.post_code,
      },
    });
  }
  await updateSuburbGeoJson();
};

export const updateReadings = async (options?: JobInitialisorOptions) => {
  const trafficVolumeStationsKeys: { [key: string]: boolean } = {};

  (
    await TrafficVolumeStation.findAll({
      attributes: ["stationKey"],
    })
  ).map((trafficVolumeStation: TrafficVolumeStation) => {
    trafficVolumeStationsKeys[trafficVolumeStation.stationKey] = true;
  });

  const api = await DataSource.findOne({
    where: { name: DATASOURCES.nswTrafficVolumeReadings.name },
  });

  let fromDate: Date;
  const toDate: Date = new Date();
  if (options?.initialise) {
    fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - YEARS_TO_SEARCH_INITIALISE);
  } else {
    fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - MONTHS_TO_SEARCH_INITIALISE);
  }

  let counts = await getDailyStationCounts(fromDate, toDate);

  // we are filtering after the api response rather than in the request itself
  // because for some reason when combining year and "filter by range" in the
  // "where" clause, the request hangs
  counts = counts.filter(
    (count) => trafficVolumeStationsKeys[count.stationKey]
  );

  const updateFrequency = await UpdateFrequency.findOne({
    where: { frequency: Frequency.DAILY },
  });

  const trafficVolumeStationsMap: { [key: string]: TrafficVolumeStation } = {};
  const loader = new Loader(counts.length, "Traffic Volume");
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
        date: count.date,
      },
      defaults: {
        trafficVolumeStationId: station.id,
        date: count.date,
        value: count.count,
        dataSourceId: api?.id,
        updateFrequencyId: updateFrequency?.id,
      },
    });
    loader.tick();
  }
};
