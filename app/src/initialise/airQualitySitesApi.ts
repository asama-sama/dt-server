import { APIS } from "../const/api";
import { updateSites } from "../controllers/airQuality";

export const airQualitySitesApi = {
  async update() {
    await updateSites();
  },

  apiConsts: APIS.nswAirQualitySites,
};
