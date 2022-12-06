/// <reference types="@types/jest" />;
import {
  getStations,
  getDailyStationCounts,
  DailyStationCount,
  Station,
} from "../../src/clients/nswTrafficVolume";
import { DATASOURCES } from "../../src/const/datasource";
import {
  updateReadings,
  updateStations,
} from "../../src/controllers/trafficVolume";
import { DataSource } from "../../src/db/models/DataSource";
import { Suburb } from "../../src/db/models/Suburb";
import { TrafficVolumeReading } from "../../src/db/models/TrafficVolumeReading";
import { TrafficVolumeStation } from "../../src/db/models/TrafficVolumeStation";
import { dateToString } from "../../src/util/date";
import { updateSuburbGeoJson } from "../../src/util/suburbUtils";

jest.mock("../../src/clients/nswTrafficVolume", () => {
  return {
    __esModule: true,
    getStations: jest.fn(),
    getDailyStationCounts: jest.fn(),
  };
});

jest.mock("../../src/util/suburbUtils", () => {
  return {
    __esModule: true,
    updateSuburbGeoJson: jest.fn(),
  };
});

const getStationsMock = getStations as jest.MockedFunction<typeof getStations>;
const getDailyStationCountsMock = getDailyStationCounts as jest.MockedFunction<
  typeof getDailyStationCounts
>;
const updateSuburbGeoJsonMock = updateSuburbGeoJson as jest.MockedFunction<
  typeof updateSuburbGeoJson
>;

describe("trafficVolume controller", () => {
  describe("updateStations", () => {
    beforeEach(async () => {
      const stations: Station[] = [
        {
          latitude: 123,
          longitude: 321,
          lga: "test",
          name: "test",
          post_code: "3000",
          rms_region: "test",
          station_id: "1",
          station_key: "2",
          suburb: "test",
        },
      ];
      getStationsMock.mockResolvedValueOnce(stations);
      await updateStations();
    });

    test("it should create new stations", async () => {
      const stationsCreated = await TrafficVolumeStation.findAll({});
      expect(stationsCreated.length).toBe(1);
    });

    test("it sets properties correctly", async () => {
      const station = await TrafficVolumeStation.findOne({
        where: { name: "test" },
      });
      expect(station).toMatchObject({
        position: {
          type: "Point",
          coordinates: [321, 123],
        },
        lga: "test",
        name: "test",
        postCode: "3000",
        rmsRegion: "test",
        stationId: "1",
        stationKey: "2",
        suburbId: expect.anything(),
      });
    });

    test("it should not create a new station if the stationId exists", async () => {
      const stations: Station[] = [
        {
          latitude: 123,
          longitude: 321,
          lga: "test",
          name: "test",
          post_code: "3000",
          rms_region: "test",
          station_id: "1",
          station_key: "2",
          suburb: "test",
        },
      ];
      getStationsMock.mockResolvedValueOnce(stations);
      await updateStations();
      const stationsCreated = await TrafficVolumeStation.findAll({});
      expect(stationsCreated.length).toBe(1);
    });

    test("it should create suburbs if they don't exist", async () => {
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(1);
    });

    test("it should not recreate suburbs", async () => {
      const stations: Station[] = [
        {
          latitude: 123,
          longitude: 321,
          lga: "test",
          name: "test",
          post_code: "3000",
          rms_region: "test",
          station_id: "1",
          station_key: "2",
          suburb: "TEST",
        },
      ];
      getStationsMock.mockResolvedValueOnce(stations);
      await updateStations();
      const suburbs = await Suburb.findAll();
      expect(suburbs.length).toBe(1);
    });

    test("it should call updateSuburbGeoJson", () => {
      expect(updateSuburbGeoJsonMock).toHaveBeenCalled();
    });
  });

  describe("updateReadings", () => {
    const insertReadings = async (stationKey: string) => {
      const readingsToAdd: DailyStationCount[] = Array.from({
        length: 3,
      }).map((_, idx) => {
        const d = new Date();
        d.setUTCFullYear(2022);
        d.setUTCMonth(7);
        d.setUTCDate(idx + 1);
        return {
          date: d,
          stationKey,
          count: idx * 100,
        };
      });

      getDailyStationCountsMock.mockResolvedValueOnce(readingsToAdd);
      await updateReadings();
    };

    let stations: TrafficVolumeStation[];

    beforeEach(async () => {
      const api = await DataSource.findOne({
        where: { name: DATASOURCES.nswTrafficVolumeStations.name },
      });
      const stationsToAdd = [1, 2, 3].map((i) => ({
        stationKey: (i * 100).toString(),
        stationId: (i * 100).toString(),
        position: { type: "Point", coordinates: [i * 100, i * 100] },
        dataSourceId: api?.id,
      }));
      stations = await TrafficVolumeStation.bulkCreate(stationsToAdd);
      await insertReadings(stations[0].stationKey);
    });

    test("it should update with new readings", async () => {
      const readings = await TrafficVolumeReading.findAll({});
      expect(readings).toMatchObject([
        {
          date: "2022-08-01",
          value: 0,
          trafficVolumeStationId: 1,
        },
        {
          date: "2022-08-02",
          value: 100,
          trafficVolumeStationId: 1,
        },
        {
          date: "2022-08-03",
          value: 200,
          trafficVolumeStationId: 1,
        },
      ]);
    });

    test("it should not reinsert already fetched readings", async () => {
      await insertReadings(stations[0].stationKey);
      const readings = await TrafficVolumeReading.findAll({});
      expect(readings.length).toBe(3);
    });

    test("it should not insert readings for which there is no TrafficVolumeStation", async () => {
      await insertReadings("333");
      const readings = await TrafficVolumeReading.findAll({});
      expect(readings.length).toBe(3);
    });

    test("it should call getDailyStationCounts with the correct fromDate and toDate on update", async () => {
      const [fromDate, toDate] = getDailyStationCountsMock.mock.lastCall;

      const fromDateString = dateToString(fromDate);
      const toDateString = dateToString(toDate);

      const date = new Date();
      const todayString = dateToString(date);

      expect(toDateString).toBe(todayString);

      date.setMonth(date.getMonth() - 1);
      const lastMonthString = dateToString(date);
      expect(fromDateString).toBe(lastMonthString);
    });

    test("it should call getDailyStationCounts with the correct fromDate and toDate on initialise", async () => {
      getDailyStationCountsMock.mockResolvedValueOnce([]);
      await updateReadings({ initialise: true });

      const [fromDate, toDate] = getDailyStationCountsMock.mock.lastCall;

      const fromDateString = dateToString(fromDate);
      const toDateString = dateToString(toDate);

      const date = new Date();
      const todayString = dateToString(date);

      expect(toDateString).toBe(todayString);

      date.setFullYear(date.getFullYear() - 3);
      const lastYearString = dateToString(date);
      expect(fromDateString).toBe(lastYearString);
    });
  });
});
