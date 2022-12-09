import { Suburb } from "../db/models/Suburb";
import { Op } from "sequelize";
import { getConnection } from "../db/connect";

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

type GetByPositionSig = (
  longitude: number,
  latitude: number,
  radius: number // in m
) => Promise<Suburb[]>;
export const getByPosition: GetByPositionSig = async (
  longitude,
  latitude,
  radius
) => {
  const sequelize = getConnection();
  const suburbs = await Suburb.findAll({
    attributes: ["id", "name", "boundary"],
    where: sequelize.where(
      sequelize.fn(
        "ST_DISTANCE",
        sequelize.col("boundary"),
        sequelize.fn(
          "Geography",
          sequelize.fn("ST_MakePoint", longitude, latitude)
        )
      ),
      {
        [Op.lte]: radius, // in m
      }
    ),
    raw: true,
  });
  return suburbs;
};
