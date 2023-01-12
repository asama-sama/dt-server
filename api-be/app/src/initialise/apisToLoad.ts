import { DATASOURCES } from "../const/datasource";
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
import { JobInitialisor } from "./jobs";

export const apisToLoad: JobInitialisor[] = [
  {
    async update() {
      await updateSites();
    },
    params: DATASOURCES.nswAirQualitySites,
  },
  {
    async update(options) {
      await callUpdateAirQualityReadings(options, new Date());
    },
    params: DATASOURCES.nswAirQualityReadings,
  },
  {
    async update() {
      await updateStations();
    },
    params: DATASOURCES.nswTrafficVolumeStations,
  },
  {
    async update(options) {
      await updateReadings(options);
    },
    params: DATASOURCES.nswTrafficVolumeReadings,
  },
  {
    async update(options) {
      await updateIncidents(options?.initialise);
    },
    params: DATASOURCES.trafficIncidents,
  },
  {
    async update() {
      await updateWeatherStations();
    },
    params: DATASOURCES.bomSites,
  },
  {
    async update() {
      await updateWeatherReadings();
    },
    params: DATASOURCES.bomReadings,
  },
];
