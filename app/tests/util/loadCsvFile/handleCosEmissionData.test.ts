/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../../src/const/datasource";
import { getConnection } from "../../../src/db/connect";
import { CosGhgCategory } from "../../../src/db/models/CosGhgCategory";
import { CosGhgEmission } from "../../../src/db/models/CosGhgEmission";
import { DataFile } from "../../../src/db/models/DataFile";
import { DataSource } from "../../../src/db/models/DataSource";
import { Suburb } from "../../../src/db/models/Suburb";
import { handleCosEmissionData } from "../../../src/util/loadCsvFile/handleCosEmissionData";

describe("handleCosEmissionData", () => {
  let dataFile: DataFile;
  beforeEach(async () => {
    const dataSource = await DataSource.findOne({
      where: {
        name: DATASOURCES.cosGhgEmissions.name,
      },
    });
    dataFile = await DataFile.create({
      name: "cos emissions",
      dataSourceId: dataSource?.id,
    });

    const suburbEmissions: Record<string, string>[] = [
      {
        OBJECTID1: "1",
        Area_suburb: "suburb1",
        Data_Category: "cat1",
        F2005_06: "3",
        F2006_07: "34.65",
        F2007_08: "200",
      },
      {
        OBJECTID1: "1",
        Area_suburb: "suburb2 + s3",
        Data_Category: "cat2",
        F2005_06: "3",
        F2008_09: "34.65",
        F2010_11: "200",
      },
    ];
    const connection = getConnection();
    await connection.transaction(async (trx) => {
      await handleCosEmissionData(suburbEmissions, dataFile, trx);
    });
  });

  test("it should load emissions into the database", async () => {
    const emissions = await CosGhgEmission.findAll({});
    expect(emissions.length).toBe(9);
    const years = [2005, 2006, 2007, 2008, 2010];
    for (const emission of emissions) {
      expect(years).toContain(emission.year);
    }
  });

  test("it should create suburbs for the emissions data", async () => {
    const suburbs = await Suburb.findAll();
    expect(suburbs.map((suburb) => suburb.name)).toEqual([
      "SUBURB1",
      "SUBURB2",
      "S3",
    ]);
  });

  test("it should create categories for the emissions data", async () => {
    const categories = await CosGhgCategory.findAll();
    expect(categories.map((category) => category.name)).toEqual([
      "cat1",
      "cat2",
    ]);
  });
});
