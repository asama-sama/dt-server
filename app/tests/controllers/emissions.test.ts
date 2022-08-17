/// <reference types="@types/jest" />;
import axios from "axios";
import { get } from "../../src/controllers/emissions";
import { loadDataFiles } from "../../src/loadDataFiles";
import * as data from "../dataArtifacts/nomanitimErskenvilleResponse.json";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Emissions Controller", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [data] });
  });

  beforeEach(async () => {
    await loadDataFiles();
  });

  describe("getBySuburb", () => {
    test("it should group emissions by suburb", async () => {
      const emissionsBySuburb = await get();
      expect(emissionsBySuburb.emissions.length).toBeGreaterThan(0);
    });

    test("it should return suburb data in the response", async () => {
      const emissionsBySuburb = await get();
      expect(emissionsBySuburb.suburbs.length).toBe(5);
    });
  });
});
