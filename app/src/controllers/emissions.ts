import { Emission } from "../db/models/Emission";
import { getConnection } from "../db/connect";

export const get = async (
  categories: number[] | undefined,
  year: number | undefined,
  sort: string
) => {
  const connection = getConnection();

  const whereOpts: { categoryId?: number[]; year?: number } = {};
  if (year) {
    whereOpts.year = year;
  }
  if (categories) {
    whereOpts.categoryId = categories;
  }

  const emissions = await Emission.findAll({
    raw: true,
    attributes: [
      "suburbId",
      [connection.fn("SUM", connection.col("reading")), "reading"],
    ],
    where: whereOpts,
    group: "suburbId",
    order: [[connection.fn("SUM", connection.col("reading")), sort]],
  });

  return emissions;
};

export const getYears = async () => {
  const years = (
    await Emission.findAll({
      attributes: ["year"],
      group: "year",
      order: [["year", "ASC"]],
    })
  ).map((emission) => emission.year);
  return years;
};
