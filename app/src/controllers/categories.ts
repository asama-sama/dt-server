import { Category } from "../db/models/Category";
import { Emission } from "../db/models/Emission";
import { getConnection } from "../db/connect";

export const get = () => {
  return Category.findAll({});
};

export const getEmissionsByCategory = () => {
  const connection = getConnection();
  return Emission.findAll({
    raw: true,
    attributes: [
      "categoryId",
      [connection.fn("SUM", connection.col("reading")), "reading"],
    ],
    group: "categoryId",
  });
};
