import { getConnection, initConnection } from "../src/db/connect";
import { runSeeds } from "../src/seeds/runSeeds";

beforeAll(() => {
  // set new env vars
  process.env.DATA_FILES_PATH = "./tests/dataFiles";
  process.env.FETCH_SUBURBS = "yes";
  process.env.NOMINATIM_API_TIMEOUT = "0";
});

beforeEach(async () => {
  await initConnection({
    dbName: "root",
    dbUser: "root",
    dbPassword: "root",
    dbHost: "localhost",
    dbPort: "5433",
    dbSchema: "dbtwins_test",
    logging: false,
  });
  await runSeeds();
});

afterEach(async () => {
  const sequelize = getConnection();
  await sequelize.dropSchema(globalThis.DB_SCHEMA, {});
  await sequelize.close();
});
