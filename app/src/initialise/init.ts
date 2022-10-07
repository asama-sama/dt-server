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
import { Sequelize } from "sequelize-typescript";

export interface ApiInitialisor {
  update(): Promise<void>;
  apiConsts: DataSourceConsts;
}

const timers: NodeJS.Timer[] = [];

const loadAndSyncApis = async () => {
  for (let i = 0; i < apisToLoad.length; i++) {
    await loadAndSyncApi(apisToLoad[i]);
  }
};

export const loadAndSyncApi = async (apiInitialisor: ApiInitialisor) => {
  const dataSource = await DataSource.findOne({
    where: {
      name: apiInitialisor.apiConsts.name,
    },
  });

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
    await DataSourceUpdateLog.create({
      dataSourceId: dataSource?.id,
      status,
      message: errorMessage,
    });
  };

  const lastUpdated = await DataSourceUpdateLog.findOne({
    where: {
      dataSourceId: dataSource?.id,
    },
    attributes: [
      [Sequelize.fn("max", Sequelize.col("createdAt")), "createdAt"],
    ],
  });
  let timeUntilUpdate = 0;
  if (lastUpdated?.createdAt) {
    const currentTime = new Date().getTime();
    const lastUpdatedTime = lastUpdated.createdAt?.getTime();
    timeUntilUpdate = currentTime - lastUpdatedTime;
  }
  const timeout = setTimeout(() => {
    const timerId = setInterval(
      () => update(),
      apiInitialisor.apiConsts.updateFrequency
    );
    timers.push(timerId);
    console.log(`Registered Api ${apiInitialisor.apiConsts.name}`);
  }, timeUntilUpdate);
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

  await runSeeds();
  await loadAndSyncApis();
  await updateSuburbGeoJson();
};
