import fs from "fs";
import csv from "csv-parser";
import { getConnection } from "../../db/connect";
import { Transaction } from "sequelize";
import { DataFile } from "../../db/models/DataFile";
import { DataSource } from "../../db/models/DataSource";
import { DATASOURCES } from "../../const/datasource";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../../db/models/DataSourceUpdateLog";
import { logger } from "../logger";
import { handleCrimeData } from "./handleCrimeData";
import { handleCosEmissionData } from "./handleCosEmissionData";
import { createBatches } from "../createBatches";

export type LoadDataFileResult = {
  totalReads: number;
  nullReads: number;
};

export type HandleProcessCsvFile = (
  results: Record<string, string>[],
  dataFile: DataFile,
  trx: Transaction
) => Promise<LoadDataFileResult>;

const dataFileHandlerMap: { [key: string]: HandleProcessCsvFile } = {
  [DATASOURCES.nswCrimeBySuburb.name]: handleCrimeData,
  [DATASOURCES.cosGhgEmissions.name]: handleCosEmissionData,
};

export const loadDataFile = async (dataFile: DataFile) => {
  logger(`read file ${dataFile.name}`);

  if (dataFile.processed) {
    return Promise.reject(`${dataFile.name} has already been processed`);
  }
  const { DATA_FILES_PATH } = process.env;
  if (!DATA_FILES_PATH) throw new Error("Must provide path to data files");

  const sequelize = getConnection();
  const promise = new Promise<LoadDataFileResult>((resolve, reject) => {
    const loadFileResult = { nullReads: 0, totalReads: 0 };
    const results: Record<string, string>[] = [];
    fs.createReadStream(`${DATA_FILES_PATH}/${dataFile.name}`)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const handler = dataFileHandlerMap[dataFile.dataSource.name];

        const CHUNK_SIZE = 25;
        const chunks = createBatches(results, CHUNK_SIZE);
        try {
          for (let i = 0; i < chunks.length; i++) {
            await sequelize.transaction(async (t: Transaction) => {
              const chunk = chunks[i];
              try {
                await sequelize.authenticate();
              } catch (e) {
                console.error("Could not connect");
                throw e;
              }
              await handler(chunk, dataFile, t);
              await DataSourceUpdateLog.create(
                {
                  dataSourceId: dataFile.dataSource.id,
                  status: UpdateStatus.SUCCESS,
                  message: `part ${i + 1}/${
                    chunks.length
                  }. Chunk size: ${CHUNK_SIZE}`,
                },
                { transaction: t }
              );
            });
          }
          await dataFile.update({
            processed: true,
            processedOn: new Date(),
          });
        } catch (e) {
          console.error(e);
          let message = "";
          if (e instanceof Error) {
            message = e.message;
          }
          await DataSourceUpdateLog.create({
            dataSourceId: dataFile.dataSource.id,
            status: UpdateStatus.FAIL,
            message,
          });
          reject(e);
        }
        resolve(loadFileResult);
      })
      .on("error", (err) => {
        console.error(err);
        reject(err);
      });
  });
  return promise;
};

export const loadCsvFiles = async () => {
  logger("loadCsvFiles");
  const filesToProcess = await DataFile.findAll({
    where: {
      processed: false,
    },
    include: { model: DataSource, as: "dataSource" },
  });
  for (const fileToProcess of filesToProcess) {
    try {
      await loadDataFile(fileToProcess);
    } catch (e) {
      console.error(e);
    }
  }
};
