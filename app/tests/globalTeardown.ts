import { getConnection } from "../src/db/connect";

module.exports = async () => {
  console.log("run global teardown");

  // const sequelize = getConnection();
  // await sequelize.close();
};
