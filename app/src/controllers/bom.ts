import { Op, Transaction } from "sequelize";
import {
  getStations,
  getStationWeather,
  StationWeatherAttributes,
} from "../clients/bom";
import { BOM_READING_TYPES } from "../const/bomReadings";
import { DATASOURCES } from "../const/datasource";
import { getConnection } from "../db/connect";
import { BomStation } from "../db/models/BomStation";
import { BomWeatherReading } from "../db/models/BomReading";
import { DataSource } from "../db/models/DataSource";

export const updateStations = async () => {
  const stations = await getStations();

  const connection = getConnection();
  connection.transaction(async (trx) => {
    for (const station of stations) {
      await BomStation.findOrCreate({
        where: {
          stationId: station.id,
        },
        defaults: {
          stationId: station.id,
          name: station.name,
        },
        transaction: trx,
      });
    }
  });
};

export const updateStationWeather = async () => {
  const stations = await BomStation.findAll();
  const dataSource = await DataSource.findOne({
    where: {
      name: DATASOURCES.bomReadings.name,
    },
  });

  // const t : keyof typeof BOM_READING_TYPES = 'gust_kmh'
  stations.map(async (station) => {
    const connection = getConnection();
    return new Promise<void>((resolve, reject) => {
      getStationWeather(station)
        .then((observations) => {
          connection.transaction(async (trx) => {
            observations.forEach(async (observation) => {
              const time = observation.local_date_time_full;
              const year = time.slice(0, 4);
              const month = time.slice(4, 6);
              const day = time.slice(6, 8);
              const hour = time.slice(8, 10);
              const minute = time.slice(10, 12);
              const date = new Date(
                `${year}-${month}-${day} ${hour}:${minute}`
              );
              const endDate = new Date(date);
              endDate.setMinutes(date.getMinutes() + 1);
              // get the configured keys to look for from the object

              await BomWeatherReading.findOrCreate({
                where: {
                  bomStationId: station.id,
                  time: {
                    [Op.between]: [date, endDate],
                  },
                },
                defaults: {
                  bomStationId: station.id,
                  time: date,
                  dataSourceid: dataSource?.id,
                  airTemp_c: observation.air_temp,
                  cloud_oktas: observation.cloud_oktas,
                  gust_kmh: observation.gust_kmh,
                  dewPoint_c: observation.dewpt,
                  pressure_hpa: observation.press,
                  rainSince9am_mm: observation.rain_trace,
                  windDir: observation.wind_dir,
                  windSpd_kmh: observation.wind_spd_kmh,
                },
                transaction: trx,
              });
            });
          });
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  });

  // for (const station of stations) {
  //   const observations = await getStationWeather(station)

  // }
};
