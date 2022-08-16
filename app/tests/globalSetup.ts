import { initConnection } from "../src/db/connect";

module.exports = async () => {
  console.log("run global setup");
  // set new env vars
  process.env.DATA_FILES_PATH = "./tests/dataFiles";
  process.env.FETCH_SUBURBS = "yes";
  process.env.NOMINATIM_API_TIMEOUT = "0";

  globalThis.DB_SCHEMA = "dbtwins_test";

  await initConnection({
    dbName: "root",
    dbUser: "root",
    dbPassword: "root",
    dbHost: "localhost",
    dbPort: "5433",
    dbSchema: "dbtwins_test",
  });
};
