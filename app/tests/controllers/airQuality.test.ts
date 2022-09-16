/// <reference types="@types/jest" />;
import {
  AirQualityReading,
  Frequency,
  PollutantType,
} from "../../src/db/models/AirQualityReading";
import { AirQualitySite } from "../../src/db/models/AirQualitySite";
import { Api } from "../../src/db/models/Api";
import {
  getDailyObservations,
  AirQualityData,
} from "../../src/clients/nswAirQuality";
import { updateDailyReadings } from "../../src/controllers/airQuality";

jest.mock("../../src/clients/nswAirQuality", () => {
  return {
    __esModule: true,
    getDailyObservations: jest.fn(),
  };
});

const getDailyObservationsMock = getDailyObservations as jest.MockedFunction<
  typeof getDailyObservations
>;

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
    date: "2022-07-10",
    value: 1,
  },
];

describe("airQuality Controller", () => {
  describe("updateDailyReadings", () => {
    let initialReadings: AirQualityReading[];
    beforeEach(async () => {
      const readingsApi = await Api.create({ name: "api1" });
      const sitesApi = await Api.create({ name: "api1" });
      const site = await AirQualitySite.create({
        siteId: 5,
        apiId: sitesApi.id,
        lat: 5.2,
        lng: 2.235,
      });

      initialReadings = await Promise.all(
        airQualityReadingsInitial.map(async (aqReadingToAdd) => {
          return AirQualityReading.create({
            date: new Date(aqReadingToAdd.date),
            value: aqReadingToAdd.value,
            apiId: readingsApi.id,
            airQualitySiteId: site.id,
          });
        })
      );
    });

    test("it should update with new readings", async () => {
      const airQualityReadingsNew: AirQualityData[] = Array.from(
        { length: 30 },
        (k, v) => v + 1
      ).map((i) => ({
        date: `2022-07-${i}`,
        value: 0.5,
        siteId: 5,
        frequency: Frequency.DAILY,
        type: PollutantType.NO2,
        quality: null,
      }));
      getDailyObservationsMock.mockReturnValueOnce(
        Promise.resolve(airQualityReadingsNew)
      );
      await updateDailyReadings(new Date("2022-07-30"));
      const readings = await AirQualityReading.findAll({});
      expect(readings.length).toBe(30);
    });
  });
});
