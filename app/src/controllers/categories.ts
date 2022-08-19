import { Category } from "../db/models/Category";

export const get = () => {
  return Category.findAll({});
};
