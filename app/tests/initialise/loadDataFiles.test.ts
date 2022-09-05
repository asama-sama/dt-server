/// <reference types="@types/jest" />;
import {
  loadDataFiles,
  loadDataFile,
  LoadDataFileResult,
} from "../../src/initialise/loadDataFiles";
import { Emission } from "../../src/db/models/Emission";
import { Suburb } from "../../src/db/models/Suburb";
import { Category } from "../../src/db/models/Category";

describe("loadDataFiles", () => {
  describe("loadDataFiles", () => {
    beforeEach(async () => {
      await loadDataFiles();
    });

    test("it should load all emissions from the files", async () => {
      const emissions = await Emission.findAll();
      expect(emissions.length).toBe(14 * 10 + 4);
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
        "NEWTOWN + ST PETERS",
        "ALEXANDRIA",
        "WATERLOO + MOORE PARK",
        "CHIPPENDALE",
        "ZETLAND",
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
      expect(emissions.length).toBe(14 * 10);
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
});
