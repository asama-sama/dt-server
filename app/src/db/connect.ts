import { Model, Sequelize } from "sequelize-typescript";
import Seq from "sequelize";
let sequelize: Sequelize;

export const getConnection = async () => {
  if (sequelize) {
    return sequelize;
  }

  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DROP_TABLES } = process.env;

  if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST) {
    throw new Error("DB connection details must be provided");
  }

  const connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: "postgres",
    models: [`${__dirname}/models`],
  });

  try {
    await connection.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  if (DROP_TABLES === "yes") {
    console.log("force schema reset");
    await connection.sync({ force: true });
  }
  await connection.sync();
  console.log("All models were synchronized successfully.");
  sequelize = connection;
  return sequelize;
};

export type ModelStatic = typeof Model & {
  new (values?: object, options?: Seq.BuildOptions): Model;
};
