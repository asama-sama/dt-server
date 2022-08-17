import { Emission, EmissionsAggregate } from "../db/models/Emission";
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
      [
        connection.fn("SUM", connection.col("reading")),
        "suburbAggregateEmission",
      ],
    ],
    group: "suburbId",
    order: [["suburbId", "ASC"]],
  })) as EmissionsAggregate[];
  return emissionsAggregate;
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
