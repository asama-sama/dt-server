/// <reference types="@types/jest" />;
import axios from "axios";
import {
  loadDataFiles,
  loadDataFile,
  LoadDataFileResult,
  updateSuburbGeoJson,
} from "../../app/src/loadDataFiles";
import { Emission } from "../src/db/models/Emission";
import { Suburb } from "../src/db/models/Suburb";
import { Category } from "../src/db/models/Category";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("loadDataFiles", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [{ geoJson: "geodata" }] });
  });

  describe("loadDataFiles", () => {
    beforeEach(async () => {
      await loadDataFiles();
    });

    test("it should load all emissions from the files", async () => {
      const emissions = await Emission.findAll();
      expect(emissions.length).toBe(14 * 7 + 4);
    });

    test("it should call make the correct number of fetch requests for suburb geodata", async () => {
      expect(axios.get).toHaveBeenCalledTimes(7);
    });
  });

  describe("loadDataFile: multiple rows", () => {
    beforeEach(async () => {
      await loadDataFile(
        "ghgEmissionsTest.csv",
        "./tests/dataFiles/ghgEmissionsTest.csv"
      );
    });

    test("correct number of suburbs loaded", async () => {
      const SUBURB_LIST = [
        "Newtown + St Peters",
        "Alexandria",
        "Waterloo + Moore Park",
        "Chippendale",
        "Zetland",
      ];
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(5);
      suburbs.forEach((suburb) => {
        expect(SUBURB_LIST).toContain(suburb.name);
      });
    });

    test("correct number of categories loaded", async () => {
      const CATEGORY_LIST = [
        "Electricity (Disaggregated)",
        "Waste Water (Disaggregated)",
        "Gas (Disaggregated)",
      ];
      const categories = await Category.findAll();
      expect(categories.length).toBe(3);
      categories.forEach((category) => {
        expect(CATEGORY_LIST).toContain(category.name);
      });
    });

    test("correct number of emissions loaded", async () => {
      const emissions = await Emission.findAll();
      expect(emissions.length).toBe(14 * 7);
      emissions.forEach((emission) => {
        expect(emission.reading).not.toBeNaN();
      });
    });
  });

  describe("loadDataFile: small", () => {
    let promiseResult: LoadDataFileResult;
    beforeEach(async () => {
      promiseResult = await loadDataFile(
        "ghgEmissionsTest_small.csv",
        "./tests/dataFiles/ghgEmissionsTest_small.csv"
      );
    });
    test("it has the correct number of emissions", async () => {
      const emissions = await Emission.findAll({});
      expect(emissions.length).toBe(4);
    });
    test("it read the emissions correctly", async () => {
      const emissions = await Emission.findAll();
      const EMISSION_READINGS = [68244.71853, null, 3, null];
      for (let i = 0; i < emissions.length; i++) {
        expect(emissions[i].reading).toBe(EMISSION_READINGS[i]);
      }
    });
    test("it should have the correct returned values from the promise", () => {
      expect(promiseResult).toMatchObject({
        totalReads: 4,
        nullReads: 2,
      });
    });
  });

  describe("updateSuburbGeoJson", () => {
    test("it should set geodata json in suburb properly", async () => {
      const suburbNames = ["s1", "s2", "s3 + s4"];

      await Suburb.bulkCreate(
        suburbNames.map((name) => ({
          name,
          shapeArea: 1,
          shapeLength: 2,
        }))
      );
      await updateSuburbGeoJson();
      const suburbs = await Suburb.findAll();
      expect(suburbs[0].geoData).toMatchObject({ s1: { geoJson: "geodata" } });
      expect(suburbs[1].geoData).toMatchObject({ s2: { geoJson: "geodata" } });
      expect(suburbs[2].geoData).toMatchObject({
        s3: { geoJson: "geodata" },
        s4: { geoJson: "geodata" },
      });
    });

    test("it should only fetch data for suburbs that don't have geojson set", async () => {
      const suburbNames = ["s1", "s2 + s3", "s3", "s5"];

      await Suburb.bulkCreate(
        suburbNames.map((name, i) => ({
          name,
          shapeArea: 1,
          shapeLength: 2,
          geoData: i % 2 === 0 ? { dataHere: "data" } : null,
        }))
      );
      await updateSuburbGeoJson();
      const suburbs = await Suburb.findAll({
        order: [["id", "ASC"]],
      });
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(suburbs[0].geoData).toMatchObject({
        dataHere: "data",
      });
      expect(suburbs[1].geoData).toMatchObject({
        s2: { geoJson: "geodata" },
        s3: { geoJson: "geodata" },
      });
      expect(suburbs[2].geoData).toMatchObject({
        dataHere: "data",
      });
      expect(suburbs[3].geoData).toMatchObject({
        s5: { geoJson: "geodata" },
      });
    });
  });
});
