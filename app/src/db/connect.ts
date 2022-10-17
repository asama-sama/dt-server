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
  logging = false,
}: {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost: string;
  dbPort: string;
  dropTables?: boolean;
  dbSchema?: string;
  logging?: boolean;
}) => {
  let connection = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: "postgres",
    models: [`${__dirname}/models`],
    port: parseInt(dbPort),
    pool: {
      max: 30,
      idle: 10000,
      acquire: 30000,
    },
    logging,
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
      pool: {
        max: 30,
        idle: 10000,
        acquire: 30000,
      },
      logging,
    });
  }

  try {
    await connection.authenticate();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  if (dropTables) {
    const schemaToReset = dbSchema ? dbSchema : "public";
    console.log("force schema reset");
    await connection.dropSchema(schemaToReset, {});
    await connection.createSchema(schemaToReset, {});
    await connection.sync();
  } else {
    try {
      await connection.sync({ alter: true });
    } catch (e) {
      console.log("sync error");
      console.error(e);
    }
  }
  sequelize = connection;
  return sequelize;
};

export type ModelStatic = typeof Model & {
  new (values?: object, options?: Seq.BuildOptions): Model;
};
