/// <reference types="@types/jest" />;
import axios from "axios";
import { loadAndSync } from "../../src/initialise/initialiseNswAirQualityApi";
import { Api } from "../../src/db/models/Api";
import { APIS } from "../../src/const/api";
import { Suburb } from "../../src/db/models/Suburb";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("initialiseNswAirQualityApi", () => {
  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue({
      data: [
        { SiteName: "site1", Region: "Sydney", Site_Id: 100 },
        { SiteName: "site2", Region: "Sydney East", Site_Id: 101 },
        { SiteName: "Sydney East", Region: "Sydney", Site_Id: 102 },
        { SiteName: "site3", Region: "region1", Site_Id: 103 },
      ],
    });
    await loadAndSync();
  });

  test("it should create an entry for the NSW Air Quality Api", async () => {
    const api = Api.findOne({
      where: {
        name: APIS.NswAirQuality,
      },
    });
    expect(api).toBeTruthy();
  });

  test("it should create suburbs for each item returned from getSites", async () => {
    const suburbs = await Suburb.findAll({});
    expect(suburbs.length).toBe(2);
  });

  test("it should not create a suburb if it is outside Sydney, or if the suburb is a region of Sydney", async () => {
    const suburbs = await Suburb.findAll({});
    for (const suburb of suburbs) {
      expect(["SITE1", "SITE2"].includes(suburb.name)).toBe(true);
    }
  });
});
