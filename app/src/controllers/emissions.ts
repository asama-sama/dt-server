import { Emission } from "../db/models/Emission";
import { getConnection } from "../db/connect";
import { Suburb } from "../db/models/Suburb";

export const get = async () => {
  const emissions = await Emission.findAll();
  const suburbs = await Suburb.findAll();

  return { emissions, suburbs };
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
