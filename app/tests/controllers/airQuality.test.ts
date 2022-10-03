/// <reference types="@types/jest" />;
import {
  AirQualityReading,
  PollutantType,
} from "../../src/db/models/AirQualityReading";
import { AirQualitySite } from "../../src/db/models/AirQualitySite";
import { Api } from "../../src/db/models/Api";
import {
  getDailyObservations,
  AirQualityData,
  getSites,
  Site,
} from "../../src/clients/nswAirQuality";
import {
  updateDailyReadings,
  updateSites,
} from "../../src/controllers/airQuality";
import {
  AirQualityReadingFrequency,
  Frequency,
} from "../../src/db/models/AirQualityReadingFrequency";

jest.mock("../../src/clients/nswAirQuality", () => {
  return {
    __esModule: true,
    getDailyObservations: jest.fn(),
    getSites: jest.fn(),
  };
});

const getDailyObservationsMock = getDailyObservations as jest.MockedFunction<
  typeof getDailyObservations
>;

const getSitesMock = getSites as jest.MockedFunction<typeof getSites>;

describe("airQuality Controller", () => {
  describe("updateDailyReadings", () => {
    const airQualityReadingsInitial = [
      {
        date: "2022-07-03",
        value: 0.1,
      },
      {
        date: "2022-07-05",
        value: 0.3,
      },
      {
        date: "2022-07-06",
        value: null,
      },
      {
        date: "2022-07-7",
        value: 1,
      },
    ];

    const airQualityReadingsNew: AirQualityData[] = Array.from(
      { length: 7 },
      (k, v) => v + 1
    ).map((i) => {
      const date = String(i).padStart(2, "0");
      return {
        date: `2022-07-${date}`,
        value: 0.5,
        siteId: 5,
        frequency: Frequency.DAILY,
        type: PollutantType.NO2,
        quality: null,
      };
    });

    let initialReadings: AirQualityReading[];
    let readingsApi: Api;
    beforeEach(async () => {
      readingsApi = await Api.create({
        name: "api1",
        uri: "http::/test",
      });
      const sitesApi = await Api.create({ name: "api1", uri: "http::/test2" });
      const site = await AirQualitySite.create({
        siteId: 5,
        apiId: sitesApi.id,
        lat: 5.2,
        lng: 2.235,
      });
      const frequency = await AirQualityReadingFrequency.create({
        frequency: Frequency.DAILY,
      });

      initialReadings = await Promise.all(
        airQualityReadingsInitial.map(async (aqReadingToAdd) => {
          return AirQualityReading.create({
            date: new Date(aqReadingToAdd.date),
            value: aqReadingToAdd.value,
            apiId: readingsApi.id,
            airQualitySiteId: site.id,
            airQualityReadingFrequencyId: frequency?.id,
          });
        })
      );
    });

    test("it should update with new readings", async () => {
      console.log("here");
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      await updateDailyReadings(readingsApi, new Date("2022-07-07"));
      const readings = await AirQualityReading.findAll({});
      expect(readings.length).toBe(7);
    });

    test("it should not update existing readings", async () => {
      const lastUpdatedInitialValues = initialReadings.map((initialReading) =>
        initialReading.updatedAt.getTime()
      );
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      await updateDailyReadings(readingsApi, new Date("2022-07-07"));
      const readings = await AirQualityReading.findAll({});
      let notUpdated = 0;
      readings.forEach((reading) => {
        if (lastUpdatedInitialValues.includes(reading.updatedAt.getTime()))
          notUpdated += 1;
      });
      expect(notUpdated).toBe(3);
    });

    test("it should update any values which were null initially", async () => {
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      await updateDailyReadings(readingsApi, new Date("2022-07-30"));
      const readings = await AirQualityReading.findAll({});
      const reading = readings.find(
        (reading) => reading.date === new Date("2022-07-06")
      );
      expect(reading?.value).not.toBeNull();
    });

    test(`it should filter out observations from the API that don't fall within the expected date range`, async () => {
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      await updateDailyReadings(readingsApi, new Date("2022-07-10"));
      const newReadings = await AirQualityReading.findAll();
      expect(newReadings.length).toBe(5);
    });
  });

  describe("updateSites", () => {
    let api: Api;
    beforeEach(async () => {
      api = await Api.create({
        name: "api1",
        uri: "api/test",
      });
    });

    test("it should add sites within the sydney region", async () => {
      const sites: Site[] = [
        {
          region: "sydney",
          name: "southside",
        },
        {
          region: "sydney",
          name: "paramatta",
        },
        {
          region: "sydney",
          name: "name1",
        },
        {
          region: "test",
          name: "name2",
        },
      ].map((site, i) => ({
        ...site,
        siteId: i + 1,
        lng: 40,
        lat: 30,
      }));
      getSitesMock.mockResolvedValueOnce(sites);
      await updateSites(api);
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);
    });

    test("it should add suburbs with 'sydney' in the name", async () => {
      const sites: Site[] = [
        {
          region: "test",
          name: "sydney",
        },
        {
          region: "test",
          name: "sydney 11###",
        },
        {
          region: "test",
          name: "woiwej sydney",
        },
        {
          region: "test",
          name: "name2",
        },
      ].map((site, i) => ({
        ...site,
        siteId: i + 1,
        lng: 40,
        lat: 30,
      }));
      getSitesMock.mockResolvedValueOnce(sites);
      await updateSites(api);
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);
    });

    test("it should update the sites", async () => {
      const sites: Site[] = [
        {
          region: "test",
          name: "sydney",
        },
        {
          region: "test",
          name: "sydney 11###",
        },
        {
          region: "test",
          name: "woiwej sydney",
        },
        {
          region: "test",
          name: "name2",
        },
      ].map((site, i) => ({
        ...site,
        siteId: i + 1,
        lng: 40,
        lat: 30,
      }));
      const sites2: Site[] = [
        {
          region: "sydney",
          name: "abc",
        },
        {
          region: "test",
          name: "test",
        },
        {
          region: "abc",
          name: "sydney ssss",
        },
      ].map((site, i) => ({
        ...site,
        siteId: i + 10,
        lng: 40,
        lat: 30,
      }));
      getSitesMock.mockResolvedValueOnce(sites);
      getSitesMock.mockResolvedValueOnce(sites2);

      await updateSites(api);
      let airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);

      await updateSites(api);
      airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(5);
    });

    test("it should not create a site if lat/lng is null", async () => {
      const sites: Site[] = [
        {
          region: "sydney",
          name: "test1",
          lat: null,
          lng: null,
          siteId: 1,
        },
      ];
      getSitesMock.mockResolvedValueOnce(sites);
      await updateSites(api);
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(0);
    });
  });
});
