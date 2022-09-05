import { Api } from "../db/models/Api";

export const getAll = async () => {
  return (await Api.findAll({})).map((api) => ({
    id: api.id,
    name: api.name,
  }));
};
