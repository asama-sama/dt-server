import { APIS } from "../const/api";
import { updateDailyReadings } from "../controllers/airQuality";
import { Api } from "../db/models/Api";

export const airQualityReadingsApi = {
  async update() {
    const api = await Api.findOne({
      where: {
        name: APIS.nswAirQualityReadings.name,
      },
    });
    if (!api)
      throw new Error(`Could not find api ${APIS.nswAirQualityReadings.name}`);
    await updateDailyReadings(api, new Date());
  },
  apiConsts: APIS.nswAirQualityReadings,
};
