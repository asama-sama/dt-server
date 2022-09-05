/// <reference types="@types/jest" />;
import axios from "axios";
import * as data from "../dataArtifacts/nomanitimErskenvilleResponse.json";
import {
  getEmissionsBySuburb,
  getYearlyEmissionsBySuburb,
  getSuburbsForApi,
} from "../../src/controllers/suburbs";
import { loadDataFile } from "../../src/initialise/loadDataFiles";
import { Emission } from "../../src/db/models/Emission";
import { Api } from "../../src/db/models/Api";
import { Suburb } from "../../src/db/models/Suburb";
import { ApiSuburb } from "../../src/db/models/ApiSuburb";

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

    test("it should filter by categoryId", async () => {
      const results = await getYearlyEmissionsBySuburb();
      const resultsFiltered = await getYearlyEmissionsBySuburb([1]);
      for (const key in resultsFiltered) {
        const yearlyTotal = results[key];
        const yearlyFiltered = resultsFiltered[key];
        yearlyFiltered.forEach((emission, i) => {
          expect(emission.reading).toBeLessThan(yearlyTotal[i].reading);
        });
      }
    });
  });

  describe("getSuburbsForApi", () => {
    let api: Api;
    beforeEach(async () => {
      api = await Api.create({
        name: "api1",
      });
      const api2 = await Api.create({
        name: "api2",
      });
      const suburb1 = await Suburb.create({
        name: "suburb1",
      });
      await ApiSuburb.create({
        apiId: api.id,
        suburbId: suburb1.id,
        apiSuburbMeta: {
          siteId: "site1",
        },
      });
      const suburb2 = await Suburb.create({
        name: "suburb2",
      });
      await ApiSuburb.create({
        apiId: api.id,
        suburbId: suburb2.id,
        apiSuburbMeta: {
          siteId: "site2",
        },
      });
      await ApiSuburb.create({
        apiId: api2.id,
        suburbId: suburb2.id,
        apiSuburbMeta: {
          siteId: "site2",
        },
      });
      const suburb3 = await Suburb.create({
        name: "suburb3",
      });

      await ApiSuburb.create({
        apiId: api2.id,
        suburbId: suburb3.id,
        apiSuburbMeta: {
          siteId: "site2",
        },
      });
    });

    test("it should return the suburbs for a given api id", async () => {
      const suburbs = await getSuburbsForApi(api.id);
      expect(suburbs.length).toBe(2);
      for (const suburb of suburbs) {
        expect(suburb.meta).toBeDefined();
      }
    });
  });
});
