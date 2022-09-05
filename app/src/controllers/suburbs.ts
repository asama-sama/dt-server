import { Suburb } from "../db/models/Suburb";
import { Op } from "sequelize";
import { getConnection } from "../db/connect";
import { Emission } from "../db/models/Emission";

export const get = async () => {
  const suburbs = await Suburb.findAll({
    where: {
      name: {
        [Op.not]: "Sydney",
      },
    },
  });

  return suburbs;
};

export const getEmissionsBySuburb = async (
  categories: number[] | undefined,
  year: number | undefined,
  sort = "desc"
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

export const getYearlyEmissionsBySuburb = async (
  categories?: number[] | undefined
) => {
  const connection = getConnection();

  const whereOpts: { categoryId?: number[] } = {};

  if (categories) {
    whereOpts.categoryId = categories;
  }

  type EmissionBySuburb = { [key: number]: Emission[] };
  const emissionsBySuburb: EmissionBySuburb = {};
  const emissions = await Emission.findAll({
    raw: true,
    attributes: [
      "suburbId",
      "year",
      [connection.fn("SUM", connection.col("reading")), "reading"],
    ],
    where: whereOpts,
    group: ["suburbId", "year"],
    order: ["year"],
  });

  for (const emission of emissions) {
    const id = emission.suburbId;
    if (!emissionsBySuburb[id]) {
      emissionsBySuburb[id] = [];
    }
    emissionsBySuburb[id].push(emission);
  }
  return emissionsBySuburb;
};
