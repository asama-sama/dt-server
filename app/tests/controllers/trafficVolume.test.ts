/// <reference types="@types/jest" />;
import {
  getStations,
  getStationCountsByMonth,
  Station,
  MonthlyStationCount,
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
import { updateSuburbGeoJson } from "../../src/util/updateSuburbGeoJson";

jest.mock("../../src/clients/nswTrafficVolume", () => {
  return {
    __esModule: true,
    getStations: jest.fn(),
    getStationCountsByMonth: jest.fn(),
  };
});

jest.mock("../../src/util/updateSuburbGeoJson", () => {
  return {
    __esModule: true,
    updateSuburbGeoJson: jest.fn(),
  };
});

const getStationsMock = getStations as jest.MockedFunction<typeof getStations>;
const getStationsCountByMonthMock =
  getStationCountsByMonth as jest.MockedFunction<
    typeof getStationCountsByMonth
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
    const readingsToAdd: MonthlyStationCount[] = Array.from({
      length: 10,
    }).map((_, idx) => ({
      year: 2022,
      month: idx,
      stationKey: "100",
      count: idx * 100,
    }));

    beforeEach(async () => {
      const api = await DataSource.findOne({
        where: { name: DATASOURCES.nswTrafficVolumeStations.name },
      });
      const stationsToAdd = [1, 2, 3].map((i) => ({
        stationKey: (i * 100).toString(),
        stationId: (i * 100).toString(),
        lat: i * 100,
        lng: i * 100,
        dataSourceId: api?.id,
      }));
      await TrafficVolumeStation.bulkCreate(stationsToAdd);
    });

    test("it should update with new readings", async () => {
      getStationsCountByMonthMock.mockResolvedValueOnce(readingsToAdd);
      await updateReadings();
      const readings = await TrafficVolumeReading.findAll({});
      expect(readings.length).toBe(10);
    });

    test("it should not update a reading if it has already been inserted", async () => {
      getStationsCountByMonthMock.mockResolvedValueOnce(readingsToAdd);
      getStationsCountByMonthMock.mockResolvedValueOnce(readingsToAdd);
      await updateReadings();
      await updateReadings();
      const readings = await TrafficVolumeReading.findAll({});
      expect(readings.length).toBe(10);
    });
  });
});
