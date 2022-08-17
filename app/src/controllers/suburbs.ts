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
