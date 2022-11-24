import { Op } from "sequelize";
import { Model } from "sequelize-typescript";
import { getConnection } from "../db/connect";
import { CosGhgCategory } from "../db/models/CosGhgCategory";
import { CosGhgEmission } from "../db/models/CosGhgEmission";
import { CosGhgEmissionSuburb } from "../db/models/CosGhgEmissionSuburb";

type GetEmissionsBySuburbParams = {
  year?: number;
  categories?: string[];
  order?: "ASC" | "DESC";
};

type EmissionsBySuburbAggregate = {
  suburbId: number;
  emissionsSum: number;
};

type GetEmissionsBySuburbSig = (
  params: GetEmissionsBySuburbParams
) => Promise<EmissionsBySuburbAggregate[]>;

class CosGhgEmissionAggregateBySuburbModel extends Model {
  dataValues: { suburbId: number; emissionsSum: number };
}

type WhereOptsGhgEmission = {
  year: number;
};

type WhereOptionsGhgCategories = {
  id: {
    [Op.or]: string[];
  };
};

export const getEmissionsBySuburb: GetEmissionsBySuburbSig = async ({
  year,
  categories,
  order = "DESC",
}) => {
  const sequelize = getConnection();

  const whereOptsGhgEmission: Partial<WhereOptsGhgEmission> = {};
  if (year) {
    whereOptsGhgEmission.year = year;
  }

  const whereOptsGhgCategories: Partial<WhereOptionsGhgCategories> = {};
  if (categories) {
    whereOptsGhgCategories.id = { [Op.or]: categories };
  }

  const emissions = (await CosGhgEmissionSuburb.findAll({
    attributes: [
      "suburbId",
      [sequelize.fn("sum", sequelize.col("reading")), "emissionsSum"],
    ],
    include: [
      {
        attributes: [],
        model: CosGhgEmission,
        where: whereOptsGhgEmission,
        include: [
          {
            attributes: [],
            model: CosGhgCategory,
            where: whereOptsGhgCategories,
          },
        ],
      },
    ],
    order: [["emissionsSum", order]],
    group: "suburbId",
  })) as unknown[];

  const response: EmissionsBySuburbAggregate[] = (<
    CosGhgEmissionAggregateBySuburbModel[]
  >emissions).map(({ dataValues: { suburbId, emissionsSum } }) => {
    return {
      emissionsSum,
      suburbId,
    };
  });

  return response;
};

export const getValidYears = async () => {
  const sequelize = getConnection();
  const years = (
    await CosGhgEmission.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("year")), "year"]],
      order: [["year", "ASC"]],
    })
  ).map((row) => row.year) as number[];
  //
  return years;
};
