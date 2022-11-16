/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../src/const/datasource";
import { getEmissionsBySuburb } from "../../src/controllers/cosGhgEmissions";
import { CosGhgCategory } from "../../src/db/models/CosGhgCategory";
import { CosGhgEmission } from "../../src/db/models/CosGhgEmission";
import { CosGhgEmissionSuburb } from "../../src/db/models/CosGhgEmissionSuburb";
import { DataFile } from "../../src/db/models/DataFile";
import { DataSource } from "../../src/db/models/DataSource";
import { Suburb } from "../../src/db/models/Suburb";

describe("cosGhgEmissions", () => {
  let category1: CosGhgCategory;
  let category2: CosGhgCategory;
  let category3: CosGhgCategory;
  beforeEach(async () => {
    const suburb = await Suburb.create({
      name: "s1",
    });
    const suburb2 = await Suburb.create({
      name: "s2",
    });
    category1 = await CosGhgCategory.create({
      name: "cat1",
    });
    category2 = await CosGhgCategory.create({
      name: "cat2",
    });
    category3 = await CosGhgCategory.create({
      name: "cat3",
    });
    const datasource = await DataSource.findOne({
      where: { name: DATASOURCES.nswAirQualityReadings.name },
    });
    if (!datasource) throw new Error();
    const dataFile = await DataFile.create({
      dataSourceId: datasource.id,
      name: "df1",
    });
    const [e1, e2, e3] = await CosGhgEmission.bulkCreate([
      {
        reading: 1.5,
        year: 2000,
        categoryId: category1.id,
        dataFileId: dataFile.id,
      },
      {
        reading: 2,
        year: 2000,
        categoryId: category2.id,
        dataFileId: dataFile.id,
      },
      {
        reading: 3,
        year: 2002,
        categoryId: category3.id,
        dataFileId: dataFile.id,
      },
    ]);
    await CosGhgEmissionSuburb.bulkCreate([
      {
        cosGhgEmissionId: e1.id,
        suburbId: suburb.id,
      },
      {
        cosGhgEmissionId: e2.id,
        suburbId: suburb.id,
      },
      {
        cosGhgEmissionId: e3.id,
        suburbId: suburb.id,
      },
      {
        cosGhgEmissionId: e3.id,
        suburbId: suburb2.id,
      },
    ]);
  });

  describe("getEmissionsBySuburb", () => {
    test("it should return emissions by suburb in descending order", async () => {
      const res = await getEmissionsBySuburb({});
      expect(res).toMatchObject([
        {
          emissionsSum: 6.5,
          suburbId: 1,
        },
        {
          emissionsSum: 3,
          suburbId: 2,
        },
      ]);
    });
    test("it should return emissions by suburb in ascending order", async () => {
      const res = await getEmissionsBySuburb({
        order: "ASC",
      });
      expect(res).toMatchObject([
        {
          emissionsSum: 3,
          suburbId: 2,
        },
        {
          emissionsSum: 6.5,
          suburbId: 1,
        },
      ]);
    });
    test("it return the emissions for only a given year", async () => {
      const res = await getEmissionsBySuburb({
        year: 2000,
      });
      expect(res).toMatchObject([
        {
          emissionsSum: 3.5,
          suburbId: 1,
        },
      ]);

      const res2 = await getEmissionsBySuburb({
        year: 2002,
      });
      expect(res2).toMatchObject([
        {
          emissionsSum: 3,
          suburbId: 1,
        },
        {
          emissionsSum: 3,
          suburbId: 2,
        },
      ]);
    });
    test("it returns the emissions for given categories", async () => {
      const res = await getEmissionsBySuburb({
        categories: [category1.id],
      });
      expect(res).toMatchObject([
        {
          emissionsSum: 1.5,
          suburbId: 1,
        },
      ]);

      const res2 = await getEmissionsBySuburb({
        categories: [category1.id, category3.id],
      });
      expect(res2).toMatchObject([
        {
          emissionsSum: 4.5,
          suburbId: 1,
        },
        {
          emissionsSum: 3,
          suburbId: 2,
        },
      ]);
    });

    test("it returns the emissions for year and category together", async () => {
      const res = await getEmissionsBySuburb({
        categories: [category2.id],
        year: 2000,
      });
      expect(res).toMatchObject([
        {
          emissionsSum: 2,
          suburbId: 1,
        },
      ]);
    });
  });
});
