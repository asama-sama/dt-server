import { initConnection } from "../db/connect";
import { init as initNswAirQuality } from "./initialiseNswAirQualityApi";
import { loadAndSync as loadAndSyncNswTrafficVolume } from "./initialiseNswTrafficVolumeApi";
import { updateSuburbGeoJson } from "./updateSuburbGeoJson";

const loadAndSyncApis = async () => {
  await initNswAirQuality();
  await loadAndSyncNswTrafficVolume();
};

export const init = async () => {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DROP_TABLES, DB_PORT } =
    process.env;

  if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT) {
    throw new Error("DB connection details must be provided");
  }

  await initConnection({
    dbName: DB_NAME,
    dbHost: DB_HOST,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
    dropTables: DROP_TABLES === "yes",
    dbPort: DB_PORT,
  });

  await loadAndSyncApis();
  await updateSuburbGeoJson();
};
