import { Suburb } from "../db/models/Suburb";
import { Op } from "sequelize";

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

export const getSuburbsById = async (ids: number[]) => {
  const suburbs = await Suburb.findAll({
    where: {
      id: {
        [Op.or]: ids,
      },
    },
  });
  return suburbs;
};

export const getAll = async () => {
  const suburbs = await Suburb.findAll({
    attributes: ["id", "name", "boundary"],
    raw: true,
  });
  return suburbs;
};
