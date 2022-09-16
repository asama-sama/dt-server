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

const airQualityReadingsNew: AirQualityData[] = Array.from(
  { length: 30 },
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

describe("airQuality Controller", () => {
  describe("updateDailyReadings", () => {
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
      getDailyObservationsMock.mockReturnValueOnce(
        Promise.resolve(airQualityReadingsNew)
      );
      await updateDailyReadings(readingsApi, new Date("2022-07-30"));
      const readings = await AirQualityReading.findAll({});
      expect(readings.length).toBe(30);
    });

    test("it should not update existing readings", async () => {
      const lastUpdatedInitialValues = initialReadings.map((initialReading) =>
        initialReading.updatedAt.getTime()
      );
      getDailyObservationsMock.mockReturnValueOnce(
        Promise.resolve(airQualityReadingsNew)
      );
      await updateDailyReadings(readingsApi, new Date("2022-07-30"));
      const readings = await AirQualityReading.findAll({});
      let notUpdated = 0;
      readings.forEach((reading) => {
        if (lastUpdatedInitialValues.includes(reading.updatedAt.getTime()))
          notUpdated += 1;
      });
      expect(notUpdated).toBe(3);
    });

    test("it should update any values which were null initially", async () => {
      getDailyObservationsMock.mockReturnValueOnce(
        Promise.resolve(airQualityReadingsNew)
      );
      await updateDailyReadings(readingsApi, new Date("2022-07-30"));
      const readings = await AirQualityReading.findAll({});
      const reading = readings.find(
        (reading) => reading.date === new Date("2022-07-06")
      );
      expect(reading?.value).not.toBeNull();
    });

    test(`it should filter out observations from the API that don't fall within the expected date range`, async () => {
      getDailyObservationsMock.mockReturnValueOnce(
        Promise.resolve(airQualityReadingsNew)
      );
      await updateDailyReadings(readingsApi, new Date("2022-08-15"));
      const newReadings = await AirQualityReading.findAll();
      expect(newReadings.length).toBe(19);
    });
  });
});
