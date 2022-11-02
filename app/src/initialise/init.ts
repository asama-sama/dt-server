import { initConnection } from "../db/connect";
import { DataSource } from "../db/models/DataSource";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../db/models/DataSourceUpdateLog";
import { apisToLoad } from "./apisToLoad";
import { updateSuburbGeoJson } from "../util/suburbUtils";
import { runSeeds } from "../seeds/runSeeds";
import { loadCsvFiles } from "../util/loadCsvFile/loadCsvFile";
import { logger } from "../util/logger";
import { JobInitialisor } from "./jobs";
import { loadDataSources } from "./loadDataSources";

const timers: NodeJS.Timer[] = [];

export const loadAndSyncApi = async (apiInitialisor: JobInitialisor) => {
  logger(`initialise ${apiInitialisor.params.name}`);
  const dataSource = await DataSource.findOne({
    where: {
      name: apiInitialisor.params.name,
    },
  });

  const update = async (
    resolve: (value: void | PromiseLike<void>) => void,
    initialise?: boolean
  ) => {
    logger(`activate ${apiInitialisor.params.name}`);
    let status: UpdateStatus = UpdateStatus.SUCCESS;
    let errorMessage = "";
    try {
      await apiInitialisor.update({ initialise: initialise ? true : false });
    } catch (e) {
      status = UpdateStatus.FAIL;
      if (e instanceof Error) errorMessage = e.message;
    }
    try {
      await DataSourceUpdateLog.create({
        dataSourceId: dataSource?.id,
        status,
        message: errorMessage,
      });
    } catch (e) {
      console.error(e);
    }
    resolve();
  };
  const lastUpdatedTime: Date = await DataSourceUpdateLog.max("createdAt", {
    where: {
      dataSourceId: dataSource?.id,
      status: UpdateStatus.SUCCESS,
    },
  });
  const lastUpdated = await DataSourceUpdateLog.findOne({
    where: {
      createdAt: lastUpdatedTime,
      dataSourceId: dataSource?.id,
    },
  });
  let timeUntilUpdate = 0;
  if (lastUpdated?.createdAt) {
    const currentTime = new Date().getTime();
    const lastUpdatedTime = lastUpdated.createdAt?.getTime();
    const timeSinceUpdate = currentTime - lastUpdatedTime;
    timeUntilUpdate = apiInitialisor.params.updateFrequency - timeSinceUpdate;
    if (timeUntilUpdate < 0) timeUntilUpdate = 0;
  }
  const timeout = new Promise<void>((resolve) => {
    setTimeout(() => {
      const timerId = setInterval(() => {
        return new Promise((resolve) => update(resolve));
      }, apiInitialisor.params.updateFrequency);
      timers.push(timerId);
      update(resolve, true);
    }, timeUntilUpdate);
  });
  return { timeout, delay: timeUntilUpdate };
};

export const init = async () => {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DROP_TABLES, DB_PORT } =
    process.env;

  if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT) {
    throw new Error("DB connection details must be provided");
  }
  logger("init");
  await initConnection({
    dbName: DB_NAME,
    dbHost: DB_HOST,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
    dropTables: DROP_TABLES === "yes",
    dbPort: DB_PORT,
  });
  logger("run seeds");
  await runSeeds();
  await loadDataSources();
  for (const apiToLoad of apisToLoad) {
    const { timeout, delay } = await loadAndSyncApi(apiToLoad);
    logger(`${apiToLoad.params.name} will run in ${delay} ms`);
    if (delay === 0) await timeout; // to stop all the apis from running at the same time on first load
  }
  await loadCsvFiles();
  updateSuburbGeoJson();
};
