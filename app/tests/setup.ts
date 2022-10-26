/// <reference types="@types/jest" />;
import path from "path";
import { Sequelize } from "sequelize-typescript";
import { getConnection, setConnection } from "../src/db/connect";
import { Suburb } from "../src/db/models/Suburb";
import { runSeeds } from "../src/seeds/runSeeds";
import { seeds } from "../src/seeds/seedList";

// let connection: Sequelize;

jest.mock("../src/db/connect", () => ({
  __esModule: true,
  getConnection: jest.fn(),
}));

const getConnectionMock = getConnection as jest.MockedFunction<
  typeof getConnection
>;

let defaultConnection: Sequelize;

beforeAll(async () => {
  // set new env vars
  process.env.DATA_FILES_PATH = "./tests/dataFiles";
  process.env.FETCH_SUBURBS = "yes";
  process.env.NOMINATIM_API_TIMEOUT = "0";
  defaultConnection = new Sequelize("root", "root", "root", {
    host: "localhost",
    dialect: "postgres",
    port: 5433,
    schema: globalThis.DB_SCHEMA,
    pool: {
      max: 30,
      idle: 10000,
      acquire: 30000,
    },
  });
  await defaultConnection.dropSchema(globalThis.DB_SCHEMA, { logging: false });
  await defaultConnection.createSchema(globalThis.DB_SCHEMA, {
    logging: false,
  });
  await defaultConnection.dropSchema(globalThis.DB_SCHEMA, {
    logging: false,
  });
  await defaultConnection.createSchema(globalThis.DB_SCHEMA, {
    logging: false,
  });

  const testdbConnection = new Sequelize("root", "root", "root", {
    host: "localhost",
    dialect: "postgres",
    models: [path.join(__dirname, "..", "/src/db/models")],
    port: 5433,
    schema: globalThis.DB_SCHEMA,
    pool: {
      max: 30,
      idle: 10000,
      acquire: 30000,
    },
    retry: {
      match: [/Deadlock/i],
      max: 3,
    },
    logging: false,
  });
  getConnectionMock.mockImplementation(() => testdbConnection);
});

beforeEach(async () => {
  const connection = getConnection();
  await connection.dropSchema(globalThis.DB_SCHEMA, {});
  await connection.createSchema(globalThis.DB_SCHEMA, {});
  await connection.sync({
    schema: globalThis.DB_SCHEMA,
    logging: false,
  });
  await runSeeds(seeds);
  jest.clearAllMocks();
});

afterAll(async () => {
  const connection = getConnection();
  await connection.close();
  await defaultConnection.close();
});
