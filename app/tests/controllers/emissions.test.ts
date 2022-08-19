/// <reference types="@types/jest" />;
import axios from "axios";
import { get, getYears } from "../../src/controllers/emissions";
import { Emission } from "../../src/db/models/Emission";
import { loadDataFile } from "../../src/loadDataFiles";
import * as data from "../dataArtifacts/nomanitimErskenvilleResponse.json";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Emissions Controller", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [data] });
  });

  beforeEach(async () => {
    await loadDataFile(
      "ghgEmissionsTest.csv",
      "./tests/dataFiles/ghgEmissionsTest.csv"
    );
  });

  describe("get", () => {
    test("it should group emissions by suburb", async () => {
      const emissions = await get(undefined, undefined);
      expect(emissions.length).toBeGreaterThan(0);
    });

    test("it should filter by category", async () => {
      const ems = (
        await Emission.findAll({
          limit: 1,
        })
      )[0];
      const emissionsTotal = await get(undefined, undefined);
      const emissions = await get([ems.categoryId], undefined);
      for (let i = 0; i < emissions.length; i++) {
        expect(emissions[i].reading).toBeLessThan(emissionsTotal[i].reading);
      }
    });

    test("it should return no results if no categories passed in", async () => {
      const emissionsTotal = await get([], undefined);
      expect(emissionsTotal.length).toBe(0);
    });

    test("it should return the emissions for a single year", async () => {
      const emissionsTotal = await get(undefined, undefined);
      const emissions2010 = await get(undefined, 2010);
      for (let i = 0; i < emissions2010.length; i++) {
        expect(emissions2010[i].reading).toBeLessThan(
          emissionsTotal[i].reading
        );
      }
    });

    test("it should return emissions given year and category", async () => {
      const ems = (
        await Emission.findAll({
          limit: 1,
        })
      )[0];
      const emissions2010 = await get(undefined, 2010);
      const emissions2010cat1 = await get([ems.categoryId], 2010);
      for (let i = 0; i < emissions2010cat1.length; i++) {
        expect(emissions2010cat1[i].reading).toBeLessThan(
          emissions2010[i].reading
        );
      }
    });
  });

  describe("getYears", () => {
    test("it should return the range of years", async () => {
      const years = await getYears();
      expect(years).toMatchObject([
        2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018,
      ]);
    });
  });
});
