import { getConnection } from "./src/db/connect";

declare global {
  // eslint-disable-next-line no-var
  var DB_SCHEMA: string;
}

module.exports = async () => {
  console.log("run global teardown");
  const sequelize = getConnection();
  await sequelize.dropSchema(globalThis.DB_SCHEMA, {});
  await sequelize.close();
};
