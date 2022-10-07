import { initConnection, getConnection } from "../db/connect";
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
import { Transaction } from "sequelize";

export interface ApiInitialisor {
  update(trx: Transaction): Promise<void>;
  apiConsts: DataSourceConsts;
}

const timers: NodeJS.Timer[] = [];

export const loadAndSyncApi = async (apiInitialisor: ApiInitialisor) => {
  const dataSource = await DataSource.findOne({
    where: {
      name: apiInitialisor.apiConsts.name,
    },
  });

  const update = async () => {
    let status: UpdateStatus = UpdateStatus.SUCCESS;
    let errorMessage = "";
    const sequelize = getConnection();
    await sequelize.transaction(async (trx) => {
      try {
        await apiInitialisor.update(trx);
      } catch (e) {
        status = UpdateStatus.FAIL;
        if (e instanceof Error) errorMessage = e.message;
      }
      await DataSourceUpdateLog.create(
        {
          dataSourceId: dataSource?.id,
          status,
          message: errorMessage,
        },
        {
          transaction: trx,
        }
      );
    });
  };

  // fixthis to return the item with the highest updated properly
  const lastUpdated = await DataSourceUpdateLog.findOne({
    where: {
      dataSourceId: dataSource?.id,
      status: UpdateStatus.SUCCESS,
    },
    attributes: [
      "status",
      [Sequelize.fn("max", Sequelize.col("createdAt")), "createdAt"],
    ],
  });
  console.log(lastUpdated);
  let timeUntilUpdate = 0;
  if (lastUpdated?.createdAt) {
    const currentTime = new Date().getTime();
    const lastUpdatedTime = lastUpdated.createdAt?.getTime();
    const timeSinceUpdate = currentTime - lastUpdatedTime;
    timeUntilUpdate =
      apiInitialisor.apiConsts.updateFrequency - timeSinceUpdate;
  }

  const timeout = new Promise<void>((resolve) => {
    setTimeout(async () => {
      const timerId = setInterval(
        async () => await update(),
        apiInitialisor.apiConsts.updateFrequency
      );
      timers.push(timerId);
      console.log(`Registered Api ${apiInitialisor.apiConsts.name}`);
      await update();
      resolve();
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

  await runSeeds();
  for (const apiToLoad of apisToLoad) {
    await loadAndSyncApi(apiToLoad);
  }
  await updateSuburbGeoJson();
};
