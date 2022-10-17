/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../src/const/datasource";
import { DataFile } from "../../src/db/models/DataFile";
import { DataSource } from "../../src/db/models/DataSource";
import {
  handleCrimeData,
  loadCsvFiles,
  loadDataFile,
  splitUpCsvFile,
  handleCosEmissionData,
} from "../../src/util/loadCsvFile";
import * as loadCsvFileModule from "../../src/util/loadCsvFile";
import { getConnection } from "../../src/db/connect";
import { CrimeIncident } from "../../src/db/models/CrimeIncident";
import { Suburb } from "../../src/db/models/Suburb";
import { CrimeCategory } from "../../src/db/models/CrimeCategory";
import { CosGhgEmission } from "../../src/db/models/CosGhgEmission";
import { CosGhgCategory } from "../../src/db/models/CosGhgCategory";

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
          Area_suburb: "suburb2",
          Data_Category: "cat1",
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
      expect(emissions.length).toBe(6);
      const years = [2005, 2006, 2007, 2008, 2010];
      for (const emission of emissions) {
        expect(years).toContain(emission.year);
      }
    });

    test("it should create suburbs for the emissions data", async () => {
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(2);
    });

    test("it should create categories for the emissions data", async () => {
      const categories = await CosGhgCategory.findAll();
      expect(categories.length).toBe(1);
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

    test("it should mark the time the file was processed", async () => {
      await dataFile?.reload();
      expect(dataFile?.processedOn).not.toBe(null);
    });
  });

  describe("loadCsvFiles", () => {
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

      await DataFile.create({
        name: "crimeDataTest.csv",
        dataSourceId: dataSource?.id,
      });
    });

    test("loadCsvFiles calls loadDataFile for each file to process", async () => {
      const spy = jest.spyOn(loadCsvFileModule, "loadDataFile");
      await loadCsvFiles();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("splitUpCsvFile", () => {
    test("it should return the correct number of chunks", () => {
      const records = Array.from({ length: 20 }).map(() => ({}));
      const chunks = splitUpCsvFile(records, 5);
      expect(chunks.length).toBe(4);
    });
  });
});
