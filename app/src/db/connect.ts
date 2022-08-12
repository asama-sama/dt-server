import { Model, Sequelize } from "sequelize-typescript";
import Seq from "sequelize";

export const getConnection = async () => {
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

  if (DROP_TABLES) {
    await connection.dropAllSchemas({}); //
  }
  await connection.sync({ force: true });
  console.log("All models were synchronized successfully.");

  return connection;
};

export type ModelStatic = typeof Model & {
  new (values?: object, options?: Seq.BuildOptions): Model;
};
