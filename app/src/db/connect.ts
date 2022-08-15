import { Model, Sequelize } from "sequelize-typescript";
import Seq from "sequelize";
let sequelize: Sequelize;

export const getConnection = () => {
  if (sequelize) {
    return sequelize;
  }
  throw new Error("Sequelize not initialized");
};

export const initConnection = async ({
  dbName,
  dbUser,
  dbPassword,
  dbHost,
  dbPort,
  dbSchema,
  dropTables,
}: {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost: string;
  dbPort: string;
  dropTables?: boolean;
  dbSchema?: string;
}) => {
  let connection = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: "postgres",
    models: [`${__dirname}/models`],
    port: parseInt(dbPort),
  });

  if (dbSchema) {
    try {
      await connection.createSchema(dbSchema, {});
    } catch (e) {
      if (e instanceof Error) {
        // ignore on "schema already exists" error
        if (!e.message.match("^.*?already exists")) {
          throw e;
        }
      }
    }
    await connection.close();
    connection = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      dialect: "postgres",
      models: [`${__dirname}/models`],
      port: parseInt(dbPort),
      schema: dbSchema,
    });
  }

  try {
    await connection.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  if (dropTables) {
    console.log("force schema reset");
    await connection.sync({ force: true, schema: dbSchema });
  } else {
    await connection.sync();
  }
  console.log("All models were synchronized successfully.");
  sequelize = connection;
  return sequelize;
};

export type ModelStatic = typeof Model & {
  new (values?: object, options?: Seq.BuildOptions): Model;
};
