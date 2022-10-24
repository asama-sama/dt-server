import { DataSourceConsts, DATASOURCES } from "../const/datasource";
import {
  callUpdateAirQualityReadings,
  updateSites,
} from "../controllers/airQuality";
import { updateReadings, updateStations } from "../controllers/trafficVolume";
import { updateIncidents } from "../controllers/nswTrafficIncidents";

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
];
