import { DataSource } from "../db/models/DataSource";

export const getAll = async () => {
  return (await DataSource.findAll({})).map((dataSource) => ({
    id: dataSource.id,
    name: dataSource.name,
  }));
};
