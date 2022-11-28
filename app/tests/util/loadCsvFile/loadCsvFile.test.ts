/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../../src/const/datasource";
import { DataFile } from "../../../src/db/models/DataFile";
import { DataSource } from "../../../src/db/models/DataSource";
import {
  loadCsvFiles,
  loadDataFile,
} from "../../../src/util/loadCsvFile/loadCsvFile";
import { handleCosEmissionData } from "../../../src/util/loadCsvFile/handleCosEmissionData";
import { handleCrimeData } from "../../../src/util/loadCsvFile/handleCrimeData";
import * as loadCsvFileModule from "../../../src/util/loadCsvFile/loadCsvFile";

jest.mock("../../../src/util/loadCsvFile/handleCrimeData");
jest.mock("../../../src/util/loadCsvFile/handleCosEmissionData");

describe("loadCsvFile", () => {
  describe("loadDataFile", () => {
    let dataFileCrime: DataFile;
    let dataFileGhg: DataFile;

    beforeEach(async () => {
      const dataSource = await DataSource.findOne({
        where: {
          name: DATASOURCES.nswCrimeBySuburb.name,
        },
      });
      await DataFile.create({
        name: "testfile.csv",
        dataSourceId: dataSource?.id,
      });
      let dataFile = await DataFile.findOne({
        where: {
          name: "testfile.csv",
          dataSourceId: dataSource?.id,
        },
        include: {
          model: DataSource,
          as: "dataSource",
        },
      });
      if (!dataFile) throw new Error("data file not found");
      dataFileCrime = dataFile;

      const cosGhgDataSource = await DataSource.findOne({
        where: {
          name: DATASOURCES.cosGhgEmissions.name,
        },
      });
      await DataFile.create({
        name: "testfile.csv",
        dataSourceId: cosGhgDataSource?.id,
      });
      dataFile = await DataFile.findOne({
        where: {
          name: "testfile.csv",
          dataSourceId: cosGhgDataSource?.id,
        },
        include: {
          model: DataSource,
          as: "dataSource",
        },
      });
      if (!dataFile) throw new Error("data file not found");
      dataFileGhg = dataFile;
    });

    describe("load crime data", () => {
      beforeEach(async () => {
        await loadDataFile(dataFileCrime);
      });

      test("it should call the handler for crime data", () => {
        expect(handleCrimeData).toHaveBeenCalled();
      });

      test("it should not call any other handlers", () => {
        expect(handleCosEmissionData).not.toHaveBeenCalled();
      });

      test("it should set the dataFile to be processed", async () => {
        await dataFileCrime?.reload();
        expect(dataFileCrime?.processed).toBe(true);
      });

      test("it should not process the dataFile again", async () => {
        expect(async () => await loadDataFile(dataFileCrime)).rejects.toBe(
          "testfile.csv has already been processed"
        );
      });

      test("it should mark the time the file was processed", async () => {
        await dataFileCrime.reload();
        expect(dataFileCrime.processedOn).not.toBe(null);
      });
    });

    describe("load ghgEmissions data", () => {
      beforeEach(async () => {
        await loadDataFile(dataFileGhg);
      });

      test("it should call the handler for cosGhgEmissions", async () => {
        expect(handleCosEmissionData).toHaveBeenCalled();
      });

      test("it should set the dataFile to be processed", async () => {
        await dataFileGhg.reload();
        expect(dataFileGhg.processed).toBe(true);
      });
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
        name: "testfile.csv",
        dataSourceId: dataSource?.id,
      });

      await DataFile.create({
        name: "testfile.csv",
        dataSourceId: dataSource?.id,
      });
    });

    test("loadCsvFiles calls loadDataFile for each file to process", async () => {
      const spy = jest.spyOn(loadCsvFileModule, "loadDataFile");
      await loadCsvFiles();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
