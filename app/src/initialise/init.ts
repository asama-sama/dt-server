import { initConnection } from "../db/connect";
import { Api } from "../db/models/Api";
import { ApiUpdateLog, UpdateStatus } from "../db/models/ApiUpdateLog";
import { ApiInitialisor } from "./ApiInitialisor";
import { airQualitySitesApi } from "./airQualitySitesApi";
import { airQualityReadingsApi } from "./airQualityReadingsApi";
import { loadAndSync as loadAndSyncNswTrafficVolume } from "./initialiseNswTrafficVolumeApi";
import { updateSuburbGeoJson } from "./updateSuburbGeoJson";

const timers: NodeJS.Timer[] = [];

const loadAndSyncApis = async () => {
  await loadAndSyncApi(airQualitySitesApi);
  await loadAndSyncApi(airQualityReadingsApi);

  // await loadAndSyncNswTrafficVolume();
};

const loadAndSyncApi = async (apiInitialisor: ApiInitialisor) => {
  await apiInitialisor.setupDb();
  const update = async () => {
    let status: UpdateStatus = UpdateStatus.SUCCESS;
    let errorMessage = "";
    try {
      await apiInitialisor.update();
    } catch (e) {
      console.error(e);
      status = UpdateStatus.FAIL;
      if (e instanceof Error) errorMessage = e.message;
    }
    const api = await Api.findOne({
      where: {
        name: apiInitialisor.apiConsts.name,
      },
    });
    const apiId = api?.id;
    await ApiUpdateLog.create({
      apiId: apiId,
      updateAt: new Date(),
      status,
      message: errorMessage,
    });
  };

  const timerId = setInterval(
    () => update(),
    apiInitialisor.apiConsts.updateFrequency
  );
  timers.push(timerId);
  await update(); // first call
  console.log(`Registered Api ${apiInitialisor.apiConsts.name}`);
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
