/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../../src/const/datasource";
import { getConnection } from "../../../src/db/connect";
import { CrimeCategory } from "../../../src/db/models/CrimeCategory";
import { CrimeIncident } from "../../../src/db/models/CrimeIncident";
import { DataFile } from "../../../src/db/models/DataFile";
import { DataSource } from "../../../src/db/models/DataSource";
import { Suburb } from "../../../src/db/models/Suburb";
import { handleCrimeData } from "../../../src/util/loadCsvFile/handleCrimeData";

describe("handleCrimeData", () => {
  let dataFile: DataFile;
  beforeEach(async () => {
    const dataSource = await DataSource.findOne({
      where: {
        name: DATASOURCES.nswCrimeBySuburb.name,
      },
    });
    dataFile = await DataFile.create({
      name: "test file",
      dataSourceId: dataSource?.id,
    });

    const crimeResults = [
      {
        "Offence category": "Derp",
        Subcategory: "derpderp",
        Suburb: "suburb 1",
        "jan 2020": "20",
        "feb 2020": "35",
      },
      {
        "Offence category": "Derp",
        Subcategory: "derpderp 2",
        Suburb: "suburb 2",
        "jan 2020": "20",
        "feb 2020": "35",
      },
    ];
    const connection = getConnection();
    await connection.transaction(async (trx) => {
      await handleCrimeData(crimeResults, dataFile, trx);
    });
  });

  test("it should load results into the database", async () => {
    const incidents = await CrimeIncident.findAll({});
    expect(incidents.length).toBe(4);
  });

  test("it should load the year and month values correctly for crime incidents", async () => {
    const incidents = await CrimeIncident.findAll({});
    for (const incident of incidents) {
      const month = incident.month;
      expect([0, 1]).toContain(month);
      expect(incident.year).toBe(2020);
    }
  });

  test("it should create associations for records loaded in", async () => {
    const suburbs = await Suburb.findAll({});
    expect(suburbs.length).toBe(2);
    const crimeCategories = await CrimeCategory.findAll({});
    expect(crimeCategories.length).toBe(2);
  });
});
