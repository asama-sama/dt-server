/// <reference types="@types/jest" />;
import {
  AirQualityReading,
  AirQualityType,
} from "../../src/db/models/AirQualityReading";
import { AirQualitySite } from "../../src/db/models/AirQualitySite";
import { DataSource } from "../../src/db/models/DataSource";
import {
  getDailyObservations,
  AirQualityData,
  getSites,
  Site,
} from "../../src/clients/nswAirQuality";
import {
  callUpdateAirQualityReadings,
  updateAirQualityReadings,
  updateSites,
} from "../../src/controllers/airQuality";
import * as airQualityController from "../../src/controllers/airQuality";
import {
  UpdateFrequency,
  Frequency,
} from "../../src/db/models/UpdateFrequency";
import { Suburb } from "../../src/db/models/Suburb";
import { updateSuburbGeoJson } from "../../src/util/suburbUtils";
import {
  AirQualityUpdateParams,
  DATASOURCES,
} from "../../src/const/datasource";
import { Op } from "sequelize";

jest.mock("../../src/clients/nswAirQuality", () => {
  return {
    __esModule: true,
    getDailyObservations: jest.fn(),
    getSites: jest.fn(),
  };
});

jest.mock("../../src/util/suburbUtils", () => {
  return {
    __esModule: true,
    updateSuburbGeoJson: jest.fn(),
  };
});

const getDailyObservationsMock = getDailyObservations as jest.MockedFunction<
  typeof getDailyObservations
>;
getDailyObservationsMock.mockResolvedValue([]);

const getSitesMock = getSites as jest.MockedFunction<typeof getSites>;

const updateSuburbGeoJsonMock = updateSuburbGeoJson as jest.MockedFunction<
  typeof updateSuburbGeoJson
>;

describe("airQuality Controller", () => {
  describe("callUpdateAirQualityReadings", () => {
    const callUpdateAirQualityReadingsSpy = jest.spyOn(
      airQualityController,
      "updateAirQualityReadings"
    );
    beforeEach(async () => {
      const sitesApi = await DataSource.create({
        name: "api2",
        uri: "http::/test2",
      });
      await AirQualitySite.create({
        siteId: 5,
        dataSourceId: sitesApi.id,
        lat: 5.2,
        lng: 2.235,
      });
    });

    test("it should call getDailyObservations the correct number of times", async () => {
      await callUpdateAirQualityReadings(new Date("2022-07-07"));

      expect(callUpdateAirQualityReadingsSpy).toBeCalledTimes(
        (<AirQualityUpdateParams[]>DATASOURCES.nswAirQualityReadings.params)
          .length
      );
    });

    test("it should call getDailyObservations with the correct values", async () => {
      await callUpdateAirQualityReadings(new Date("2022-07-07"));
      const sitesMap: { [key: number]: AirQualitySite } = {};
      const sites = await AirQualitySite.findAll();
      sites.map((site) => (sitesMap[site.siteId] = site));
      callUpdateAirQualityReadingsSpy.mock.calls.forEach((call, i) => {
        expect(call).toEqual([
          (<AirQualityUpdateParams[]>DATASOURCES.nswAirQualityReadings.params)[
            i
          ],
          sitesMap,
          new Date("2022-06-30"),
          new Date("2022-07-07"),
        ]);
      });
    });
  });

  describe("updateAirQualityReadings", () => {
    let initialReadings: AirQualityReading[];
    let readingsApi: DataSource;
    const sitesMap: { [key: number]: AirQualitySite } = {};
    beforeEach(async () => {
      readingsApi = await DataSource.create({
        name: "api1",
        uri: "http::/test",
      });
      const sitesApi = await DataSource.create({
        name: "api2",
        uri: "http::/test2",
      });
      const site = await AirQualitySite.create({
        siteId: 5,
        dataSourceId: sitesApi.id,
        lat: 5.2,
        lng: 2.235,
      });
      const frequency = await UpdateFrequency.findOne({
        where: { frequency: Frequency.DAILY },
      });

      initialReadings = await Promise.all(
        Array.from({ length: 7 }).map(async (item, idx) => {
          return AirQualityReading.create({
            date: new Date(`2022-10-${idx + 1}`),
            value: idx,
            type: AirQualityType.NO2,
            hour: 0,
            dataSourceId: readingsApi.id,
            airQualitySiteId: site.id,
            updateFrequencyId: frequency?.id,
          });
        })
      );

      const airQualityReadingsApi: AirQualityData[] = Array.from({
        length: 7,
      }).map((item, idx) => {
        const date = String(idx + 5).padStart(2, "0");
        return {
          date: `2022-10-${date}`,
          value: 0.5,
          siteId: 5,
          frequency: Frequency.DAILY,
          type: AirQualityType.NO2,
          quality: null,
          hour: 0,
        };
      });

      getDailyObservationsMock.mockResolvedValue(airQualityReadingsApi);
      sitesMap[site.siteId] = site;
      await updateAirQualityReadings(
        (<AirQualityUpdateParams[]>DATASOURCES.nswAirQualityReadings.params)[0],
        sitesMap,
        new Date("2022-09-30"),
        new Date("2022-10-15")
      );
    });

    test("it should update with new readings", async () => {
      const readings = await AirQualityReading.findAll({});
      expect(readings.length).toBe(11);
    });

    test("it should not update existing readings", async () => {
      const lastUpdatedInitialValues = initialReadings.map((initialReading) =>
        initialReading.updatedAt.getTime()
      );
      const readings = await AirQualityReading.findAll({});
      let notUpdated = 0;
      readings.forEach((reading) => {
        if (lastUpdatedInitialValues.includes(reading.updatedAt.getTime()))
          notUpdated += 1;
      });
      expect(notUpdated).toBe(initialReadings.length);
    });

    test("it should update any values which were null initially", async () => {
      const reading = await AirQualityReading.findOne({
        where: {
          date: {
            [Op.between]: [new Date("2022-10-10"), new Date("2022-10-11")],
          },
        },
      });
      await reading?.update({
        value: null,
      });
      reading?.reload();
      expect(reading?.value).toBe(null);
      await updateAirQualityReadings(
        (<AirQualityUpdateParams[]>DATASOURCES.nswAirQualityReadings.params)[0],
        sitesMap,
        new Date("2022-09-30"),
        new Date("2022-10-15")
      );
      await reading?.reload();
      expect(reading?.value).not.toBe(null);
    });

    test("it should add new readings for the same date and site if they are of different types", async () => {
      const airQualityReadingsNew: AirQualityData[] = [
        {
          date: `2022-07-01`,
          value: 0.5,
          siteId: 5,
          frequency: Frequency.DAILY,
          type: AirQualityType.WDR,
          quality: null,
          hour: 0,
        },
      ];
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      const wdrParams = (<AirQualityUpdateParams[]>(
        DATASOURCES.nswAirQualityReadings.params
      )).find((params) => params.parameters[0] === "WDR");
      await updateAirQualityReadings(
        <AirQualityUpdateParams>wdrParams,
        sitesMap,
        new Date("2022-09-30"),
        new Date("2022-10-15")
      );
      const readings = await AirQualityReading.findAll();
      expect(readings.length).toBe(12);
    });

    test("it should not add new readings if they have the same date/time/type", async () => {
      const airQualityReadingsNew: AirQualityData[] = [
        {
          date: `2022-10-01`,
          value: 0.5,
          siteId: 5,
          frequency: Frequency.DAILY,
          type: AirQualityType.NO2,
          quality: null,
          hour: 0,
        },
      ];
      const oldReadings = await AirQualityReading.findAll();
      getDailyObservationsMock.mockResolvedValueOnce(airQualityReadingsNew);
      const no2Params = (<AirQualityUpdateParams[]>(
        DATASOURCES.nswAirQualityReadings.params
      )).find((params) => params.parameters[0] === "NO2");
      await updateAirQualityReadings(
        <AirQualityUpdateParams>no2Params,
        sitesMap,
        new Date("2022-09-30"),
        new Date("2022-10-15")
      );
      const readings = await AirQualityReading.findAll();
      expect(readings.length).toBe(oldReadings.length);
    });

    test("it should call getDailyObservations with the correct values", () => {
      expect(getDailyObservationsMock).toHaveBeenCalledWith(
        (<AirQualityUpdateParams[]>DATASOURCES.nswAirQualityReadings.params)[0],
        [5],
        "2022-09-30",
        "2022-10-15"
      );
    });
  });

  describe("updateSites", () => {
    beforeEach(async () => {
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
      await updateSites();
    });

    test("it should add sites within the sydney region", async () => {
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);
    });

    test("it should add suburbs with 'sydney' in the name", async () => {
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);
    });

    test("it should update the sites", async () => {
      const sites: Site[] = [
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

      await updateSites();
      const airQualitySites = await AirQualitySite.findAll({});
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
      await updateSites();
      const airQualitySites = await AirQualitySite.findAll({});
      expect(airQualitySites.length).toBe(3);
    });

    test("it should create suburbs if they don't exist", async () => {
      const suburbs = await Suburb.findAll();
      const suburbNames = ["sydney", "sydney 11###", "woiwej sydney"].map(
        (name) => name.toUpperCase()
      );
      expect(suburbs.length).toBe(3);
      for (const suburb of suburbs) {
        expect(suburbNames).toContain(suburb.name);
      }
    });

    test("it should not create a suburb if it already exists", async () => {
      const sites: Site[] = [
        {
          region: "sydney",
          name: "ttttttt",
          lat: null,
          lng: null,
          siteId: 1,
        },
      ];
      getSitesMock.mockResolvedValueOnce(sites);
      await updateSites();
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(3);
    });

    test("it should call updateSuburbGeoJson", () => {
      expect(updateSuburbGeoJsonMock).toHaveBeenCalled();
    });
  });
});
