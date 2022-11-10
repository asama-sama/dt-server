import { Op } from "sequelize";
import { getStations, getStationWeather } from "../clients/bom";
import { DATASOURCES } from "../const/datasource";
import { getConnection } from "../db/connect";
import { BomStation } from "../db/models/BomStation";
import { BomReading } from "../db/models/BomReading";
import { DataSource } from "../db/models/DataSource";
import { Suburb } from "../db/models/Suburb";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../db/models/DataSourceUpdateLog";
import { Loader } from "../util/loader";

export const updateStations = async () => {
  const stations = await getStations();
  const dataSource = await DataSource.findOne({
    where: {
      name: DATASOURCES.bomSites.name,
    },
  });
  const connection = getConnection();
  await connection.transaction(async (trx) => {
    for (const station of stations) {
      const [suburb] = await Suburb.findOrCreate({
        where: { name: station.name.toUpperCase() },
        transaction: trx,
      });

      await BomStation.findOrCreate({
        where: {
          stationId: station.id,
        },
        defaults: {
          stationId: station.id,
          dataSourceId: dataSource?.id,
          suburbId: suburb.id,
          name: station.name,
        },
        transaction: trx,
      });
    }
  });
};

export const updateReadings = async () => {
  const stations = await BomStation.findAll();
  const dataSource = await DataSource.findOne({
    where: {
      name: DATASOURCES.bomReadings.name,
    },
  });
  const loader = new Loader(stations.length);
  const connection = getConnection();
  for (const station of stations) {
    await connection.transaction(async (trx) => {
      await getStationWeather(station)
        .then(async (observations) => {
          for (const observation of observations) {
            const { lat, lon } = observation;
            if (
              station.lat === null ||
              (station.lng === null && (lat || lon))
            ) {
              await station.update(
                {
                  lat,
                  lng: lon,
                },
                { transaction: trx }
              );
            }

            const time = observation.local_date_time_full;
            if (!time) throw new Error("no timestamp found");
            const year = time.slice(0, 4);
            const month = time.slice(4, 6);
            const day = time.slice(6, 8);
            const hour = time.slice(8, 10);
            const minute = time.slice(10, 12);
            const date = new Date(`${year}-${month}-${day} ${hour}:${minute}`);
            const endDate = new Date(date);
            endDate.setMinutes(date.getMinutes() + 1);
            await BomReading.findOrCreate({
              where: {
                bomStationId: station.id,
                time: {
                  [Op.between]: [date, endDate],
                },
              },
              defaults: {
                bomStationId: station.id,
                dataSourceId: dataSource?.id,
                time: date,
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
          }
        })
        .catch(async (e) => {
          let message = `error loading weather station ${station.name}`;
          if (e instanceof Error) {
            message += `: ${e.message}`;
          }
          await DataSourceUpdateLog.create({
            dataSourceId: dataSource?.id,
            status: UpdateStatus.FAIL,
            message,
          });
        });
      loader.tick();
    });
  }
};
