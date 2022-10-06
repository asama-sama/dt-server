/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../src/const/datasource";
import { DataFile } from "../../src/db/models/DataFile";
import { DataSource } from "../../src/db/models/DataSource";
import { handleCrimeData, loadDataFile } from "../../src/util/loadCsvFile";
import { getConnection } from "../../src/db/connect";
import { CrimeIncident } from "../../src/db/models/CrimeIncident";
import { Suburb } from "../../src/db/models/Suburb";
import { CrimeCategory } from "../../src/db/models/CrimeCategory";

describe("loadCsvFile", () => {
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
          LGA: "suburb 1",
          "jan 2020": "20",
          "feb 2020": "35",
        },
        {
          "Offence category": "Derp",
          Subcategory: "derpderp 2",
          LGA: "suburb 2",
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

    test("it should should not create new entries for repeat values", async () => {
      const crimeResults = [
        {
          "Offence category": "Derp",
          Subcategory: "derpderp",
          LGA: "suburb 1",
          "jan 2020": "20",
          "feb 2020": "35",
        },
      ];
      const connection = getConnection();
      await connection.transaction(async (trx) => {
        await handleCrimeData(crimeResults, dataFile, trx);
      });
      const crimeIncidents = await CrimeIncident.findAll({});
      expect(crimeIncidents.length).toBe(4);
    });
  });

  describe("loadDataFile", () => {
    let dataFile: DataFile | null;
    beforeEach(async () => {
      const dataSource = await DataSource.findOne({
        where: {
          name: DATASOURCES.nswCrimeBySuburb.name,
        },
      });

      await DataFile.create({
        name: "crimeDataTest.csv",
        dataSourceId: dataSource?.id,
      });

      dataFile = await DataFile.findOne({
        where: {
          name: "crimeDataTest.csv",
        },
        include: {
          model: DataSource,
          as: "dataSource",
        },
      });

      if (!dataFile) throw new Error("DataFile not loaded");
      await loadDataFile(dataFile);
    });

    test("it should load crime incidents from the file", async () => {
      const incidents = await CrimeIncident.findAll({});
      expect(incidents.length).toBe(8);
    });

    test("it should create CrimeCategories", async () => {
      const categories = await CrimeCategory.findAll();
      expect(categories.length).toBe(3);
    });

    test("it should create Suburbs", async () => {
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(2);
    });

    test("it should set the dataFile to be processed", async () => {
      await dataFile?.reload();
      expect(dataFile?.processed).toBe(true);
    });

    test("it should not process the dataFile again", async () => {
      const file = dataFile as DataFile;
      expect(async () => await loadDataFile(file)).rejects.toBe(
        "crimeDataTest.csv has already been processed"
      );
    });
  });
});
