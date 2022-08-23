/// <reference types="@types/jest" />;
import axios from "axios";
import * as data from "../dataArtifacts/nomanitimErskenvilleResponse.json";
import {
  getEmissionsBySuburb,
  getYearlyEmissionsBySuburb,
} from "../../src/controllers/suburbs";
import { loadDataFile } from "../../src/loadDataFiles";
import { Emission } from "../../src/db/models/Emission";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Suburbs Controller", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [data] });
  });

  beforeEach(async () => {
    await loadDataFile(
      "ghgEmissionsTest.csv",
      "./tests/dataFiles/ghgEmissionsTest.csv"
    );
  });

  describe("getEmissionsBySuburb", () => {
    test("it should group emissions by suburb", async () => {
      const emissions = await getEmissionsBySuburb(undefined, undefined);
      expect(emissions.length).toBeGreaterThan(0);
    });

    test("it should filter by category", async () => {
      const ems = (
        await Emission.findAll({
          limit: 1,
        })
      )[0];
      const emissionsTotal = await getEmissionsBySuburb(undefined, undefined);
      const emissions = await getEmissionsBySuburb([ems.categoryId], undefined);
      for (let i = 0; i < emissions.length; i++) {
        expect(emissions[i].reading).toBeLessThan(emissionsTotal[i].reading);
      }
    });

    test("it should return no results if no categories passed in", async () => {
      const emissionsTotal = await getEmissionsBySuburb([], undefined);
      expect(emissionsTotal.length).toBe(0);
    });

    test("it should return the emissions for a single year", async () => {
      const emissionsTotal = await getEmissionsBySuburb(undefined, undefined);
      const emissions2010 = await getEmissionsBySuburb(undefined, 2010);
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
      const emissions2010 = await getEmissionsBySuburb(undefined, 2010);
      const emissions2010cat1 = await getEmissionsBySuburb(
        [ems.categoryId],
        2010
      );
      for (let i = 0; i < emissions2010cat1.length; i++) {
        expect(emissions2010cat1[i].reading).toBeLessThan(
          emissions2010[i].reading
        );
      }
    });
  });

  describe("getYearlyEmissionsBySuburb", () => {
    test("it should return an object indexed by suburbId", async () => {
      const results = await getYearlyEmissionsBySuburb();
      expect(Object.keys(results).length).toBe(5);
    });

    test("each value should be an array of emissions", async () => {
      const results = await getYearlyEmissionsBySuburb();
      for (const key in results) {
        const emissions = results[key];
        expect(emissions.length).toBeGreaterThan(0);
        for (const emission of emissions) {
          expect(emission.reading).toBeDefined();
        }
      }
    });
  });
});
