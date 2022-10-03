import { initConnection } from "../db/connect";
import { Api } from "../db/models/Api";
import { ApiUpdateLog, UpdateStatus } from "../db/models/ApiUpdateLog";
import { ApiInitialisor } from "./ApiInitialisor";
import { initialiseNswAirQualitySitesApi } from "./initialiseNswAirQualitySitesApi";
import { loadAndSync as loadAndSyncNswTrafficVolume } from "./initialiseNswTrafficVolumeApi";
import { updateSuburbGeoJson } from "./updateSuburbGeoJson";

const timers: NodeJS.Timer[] = [];

const loadAndSyncApis = async () => {
  loadAndSyncApi(initialiseNswAirQualitySitesApi);
  // await loadAndSyncNswTrafficVolume();
};

const loadAndSyncApi = async (apiInitialisor: ApiInitialisor) => {
  await apiInitialisor.setupDb();
  const update = async () => {
    let status: UpdateStatus = UpdateStatus.SUCCESS;
    try {
      await apiInitialisor.update();
    } catch (e) {
      status = UpdateStatus.FAIL;
    }
    const api = await Api.findOne({
      where: {
        name: apiInitialisor.apiConsts.name,
      },
    });
    const apiId = api?.id;
    ApiUpdateLog.create({
      apiId: apiId,
      updateAt: new Date(),
      status,
    });
  };

  const timerId = setInterval(
    () => update(),
    apiInitialisor.apiConsts.updateFrequency
  );
  timers.push(timerId);
  await update(); // first call
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
