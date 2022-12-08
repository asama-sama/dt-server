/// <reference types="@types/jest" />;
import path from "path";
import { Sequelize } from "sequelize-typescript";
import { getConnection } from "../src/db/connect";
import { runSeeds } from "../src/seeds/runSeeds";
import { loadDataSources } from "../src/initialise/loadDataSources";

jest.mock("../src/db/connect", () => ({
  __esModule: true,
  getConnection: jest.fn(),
}));

const getConnectionMock = getConnection as jest.MockedFunction<
  typeof getConnection
>;

jest.mock("../src/util/logger", () => ({
  __esModule: true,
  logger: jest.fn(),
}));

let defaultConnection: Sequelize;

beforeAll(async () => {
  // set new env vars
  process.env.DATA_FILES_PATH = "./tests/dataFiles";
  process.env.FETCH_SUBURBS = "yes";
  process.env.NOMINATIM_API_TIMEOUT = "500";
  process.env.DB_SCHEMA = globalThis.DB_SCHEMA;
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
    logging: false, // toggle this to get query output
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

  await loadDataSources();
  await runSeeds();
  jest.clearAllMocks();
});

afterAll(async () => {
  const connection = getConnection();
  await connection.dropSchema(globalThis.DB_SCHEMA, {});
  await connection.close();
  await defaultConnection.close();
});
