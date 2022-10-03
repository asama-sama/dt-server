import { APIS } from "../const/api";
import { updateDailyReadings } from "../controllers/airQuality";

export const airQualityReadingsApi = {
  async update() {
    await updateDailyReadings(new Date());
  },
  apiConsts: APIS.nswAirQualityReadings,
};
