import { getConnection, initConnection } from "../src/db/connect";

beforeAll(async () => {
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

afterAll(async () => {
  const sequelize = getConnection();
  await sequelize.close();
});
