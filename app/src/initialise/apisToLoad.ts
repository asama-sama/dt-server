import { ApiConsts, APIS } from "../const/api";
import { updateDailyReadings, updateSites } from "../controllers/airQuality";
import { updateStations } from "../controllers/trafficVolume";

export interface ApiInitialisor {
  update(): Promise<void>;
  apiConsts: ApiConsts;
}

export const apisToLoad: ApiInitialisor[] = [
  {
    async update() {
      await updateSites();
    },
    apiConsts: APIS.nswAirQualitySites,
  },
  {
    async update() {
      await updateDailyReadings(new Date());
    },
    apiConsts: APIS.nswAirQualityReadings,
  },
  {
    async update() {
      await updateStations();
    },
    apiConsts: APIS.nswTrafficVolumeStations,
  },
];
