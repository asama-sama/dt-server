/// <reference types="@types/jest" />;
import { getYears } from "../../src/controllers/emissions";
import { loadDataFile } from "../../src/initialise/loadDataFiles";

describe("Emissions Controller", () => {
  describe("getYears", () => {
    beforeEach(async () => {
      await loadDataFile(
        "ghgEmissionsTest.csv",
        "./tests/dataFiles/ghgEmissionsTest.csv"
      );
    });

    test("it should return the range of years", async () => {
      const years = await getYears();
      expect(years).toMatchObject([
        2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018,
      ]);
    });
  });
});
