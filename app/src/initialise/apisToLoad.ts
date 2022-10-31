import { DataSourceConsts, DATASOURCES } from "../const/datasource";
import {
  callUpdateAirQualityReadings,
  updateSites,
} from "../controllers/airQuality";
import { updateReadings, updateStations } from "../controllers/trafficVolume";
import { updateIncidents } from "../controllers/nswTrafficIncidents";
import {
  updateReadings as updateWeatherReadings,
  updateStations as updateWeatherStations,
} from "../controllers/bom";

export interface ApiInitialisor {
  update(): Promise<void>;
  apiConsts: DataSourceConsts;
}

export const apisToLoad: ApiInitialisor[] = [
  {
    async update() {
      await updateSites();
    },
    apiConsts: DATASOURCES.nswAirQualitySites,
  },
  {
    async update() {
      await callUpdateAirQualityReadings(new Date());
    },
    apiConsts: DATASOURCES.nswAirQualityReadings,
  },
  {
    async update() {
      await updateStations();
    },
    apiConsts: DATASOURCES.nswTrafficVolumeStations,
  },
  {
    async update() {
      await updateReadings();
    },
    apiConsts: DATASOURCES.nswTrafficVolumeReadings,
  },
  {
    async update() {
      await updateIncidents();
    },
    apiConsts: DATASOURCES.trafficIncidents,
  },
  {
    async update() {
      await updateWeatherStations();
    },
    apiConsts: DATASOURCES.bomSites,
  },
  {
    async update() {
      await updateWeatherReadings();
    },
    apiConsts: DATASOURCES.bomReadings,
  },
];
