import { initConnection } from "../db/connect";
import { DataSource } from "../db/models/DataSource";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../db/models/DataSourceUpdateLog";
import { DataSourceConsts } from "../const/datasource";
import { apisToLoad } from "./apisToLoad";
import { updateSuburbGeoJson } from "../util/updateSuburbGeoJson";
import { runSeeds } from "../seeds/runSeeds";
import { seeds } from "../seeds/seedList";
import { loadCsvFiles } from "../util/loadCsvFile";

export interface ApiInitialisor {
  update(): Promise<void>;
  apiConsts: DataSourceConsts;
}

const timers: NodeJS.Timer[] = [];

export const loadAndSyncApi = async (apiInitialisor: ApiInitialisor) => {
  const dataSource = await DataSource.findOne({
    where: {
      name: apiInitialisor.apiConsts.name,
    },
  });

  const update = async (resolve: (value: void | PromiseLike<void>) => void) => {
    let status: UpdateStatus = UpdateStatus.SUCCESS;
    let errorMessage = "";
    try {
      await apiInitialisor.update();
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
    timeUntilUpdate =
      apiInitialisor.apiConsts.updateFrequency - timeSinceUpdate;
  }
  const timeout = new Promise<void>((resolve) => {
    setTimeout(() => {
      const timerId = setInterval(() => {
        return new Promise((resolve) => update(resolve));
      }, apiInitialisor.apiConsts.updateFrequency);
      timers.push(timerId);
      update(resolve);
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

  await initConnection({
    dbName: DB_NAME,
    dbHost: DB_HOST,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
    dropTables: DROP_TABLES === "yes",
    dbPort: DB_PORT,
  });
  await runSeeds(seeds);
  for (const apiToLoad of apisToLoad) {
    await loadAndSyncApi(apiToLoad);
  }
  await loadCsvFiles();
  updateSuburbGeoJson();
};
