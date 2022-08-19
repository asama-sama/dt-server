import { Emission } from "../db/models/Emission";
import { getConnection } from "../db/connect";
import { Suburb } from "../db/models/Suburb";

export const get = async () => {
  const emissions = await Emission.findAll();

  return { emissions };
};

export const getAggregate = async () => {
  const connection = getConnection();

  const emissionsAggregate = (await Emission.findAll({
    raw: true,
    attributes: [
      "suburbId",
      [connection.fn("SUM", connection.col("reading")), "reading"],
    ],
    group: "suburbId",
    order: [["suburbId", "ASC"]],
  })) as Emission[];
  return emissionsAggregate;
};

export const getEmissionsByYear = async () => {
  type YearSuburbMap = { [key: string]: Emission[] };
  const connection = getConnection();

  const emissions = (await Emission.findAll({
    attributes: [
      "suburbId",
      "year",
      [connection.fn("SUM", connection.col("reading")), "reading"],
    ],
    group: ["suburbId", "year"],
  })) as Emission[];
  const yearSuburbMap: YearSuburbMap = {};

  emissions.forEach((emission) => {
    const { year } = emission;

    if (!yearSuburbMap[year]) {
      yearSuburbMap[year] = [emission];
    } else {
      yearSuburbMap[year] = [...yearSuburbMap[year], emission];
    }
  });

  return yearSuburbMap;
};

export const getCount = async () => {
  const connection = getConnection();

  const emissionsGrouped = await Emission.findAll({
    attributes: [
      "suburbId",
      [connection.fn("COUNT", connection.col("suburbId")), "suburbsCount"],
    ],
    group: "suburbId",
  });
  const suburbs = await Suburb.findAll();
  return { emissionsGrouped, suburbs };
};
