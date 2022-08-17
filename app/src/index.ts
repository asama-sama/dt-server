import express, { Express } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import { initConnection } from "./db/connect";
import { loadDataFiles } from "./loadDataFiles";
import { routes } from "./api";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const init = async () => {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DROP_TABLES, DB_PORT } =
    process.env;

  if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT) {
    throw new Error("DB connection details must be provided");
  }

  await initConnection({
    dbName: DB_NAME,
    dbHost: DB_HOST,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
    dropTables: DROP_TABLES === "yes",
    dbPort: DB_PORT,
  });
  await loadDataFiles();
};
init();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
