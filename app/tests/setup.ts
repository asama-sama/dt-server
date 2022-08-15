import { getConnection, initConnection } from "../src/db/connect";

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
});

afterEach(async () => {
  const sequelize = getConnection();
  await sequelize.dropSchema(globalThis.DB_SCHEMA, {});
  await sequelize.close();
});
