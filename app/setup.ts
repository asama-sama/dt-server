import { getConnection, initConnection } from "./src/db/connect";

declare global {
  // eslint-disable-next-line no-var
  var DB_SCHEMA: string;
}

module.exports = async () => {
  console.log("run global setup");
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
