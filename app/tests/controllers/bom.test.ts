/// <reference types="@types/jest" />;
import {
  getStations,
  WeatherStation,
  getStationWeather,
} from "../../src/clients/bom";
import { updateStations, updateReadings } from "../../src/controllers/bom";
import { BomReading } from "../../src/db/models/BomReading";
import { BomStation } from "../../src/db/models/BomStation";
import { DataSource } from "../../src/db/models/DataSource";
import { Suburb } from "../../src/db/models/Suburb";
jest.mock("../../src/clients/bom", () => ({
  __esModule: true,
  getStations: jest.fn(),
  getStationWeather: jest.fn(),
}));

const getStationsMock = getStations as jest.MockedFunction<typeof getStations>;

const getStationWeatherMock = getStationWeather as jest.MockedFunction<
  typeof getStationWeather
>;

describe("bom", () => {
  describe("updateStations", () => {
    const weatherStations: WeatherStation[] = [
      {
        id: "id1",
        name: "name1",
      },
      {
        id: "id2",
        name: "name2",
      },
      {
        id: "id3",
        name: "name3",
      },
    ];
    getStationsMock.mockResolvedValue(Promise.resolve(weatherStations));

    beforeEach(async () => {
      await updateStations();
    });

    test("it should call get stations", async () => {
      expect(getStationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateReadings", () => {
    getStationWeatherMock.mockResolvedValue([
      {
        sort_order: 67,
        wmo: 94573,
        name: "Casino",
        history_product: "IDN60801",
        local_date_time: "26/03:30am",
        local_date_time_full: "20221026033000",
        aifstime_utc: "20221025163000",
        lat: -28.9,
        lon: 153.1,
        apparent_t: 21.8,
        cloud: "-",
        cloud_base_m: null,
        cloud_oktas: null,
        cloud_type: "-",
        cloud_type_id: null,
        delta_t: 0.8,
        gust_kmh: 11,
        gust_kt: 6,
        air_temp: 20.0,
        dewpt: 18.7,
        press: 1004.5,
        press_msl: 1004.5,
        press_qnh: 1004.5,
        press_tend: "-",
        rain_trace: "0.0",
        rel_hum: 92,
        sea_state: "-",
        swell_dir_worded: "-",
        swell_height: null,
        swell_period: null,
        vis_km: "-",
        weather: "-",
        wind_dir: "NW",
        wind_spd_kmh: 7,
        wind_spd_kt: 4,
      },
    ]);

    let dataSource: DataSource;
    beforeEach(async () => {
      dataSource = await DataSource.create({
        name: "datasource 1",
      });
      const suburb = await Suburb.create({
        name: "suburb1",
      });
      await BomStation.create({
        dataSourceId: dataSource?.id,
        stationId: "stationId",
        suburbId: suburb.id,
        name: "station name",
      });
      await updateReadings();
    });

    test("it should add the reading", async () => {
      const readings = await BomReading.findAll();
      expect(readings.length).toBe(1);
    });

    test("it should set lat lng on station", async () => {
      const stations = await BomStation.findAll();
      expect(stations[0].lat).not.toBeNull();
      expect(stations[0].lng).not.toBeNull();
    });

    test("it should add a reading at the same time but different station", async () => {
      const suburb = await Suburb.create({
        name: "suburb2",
      });
      await BomStation.create({
        dataSourceId: dataSource?.id,
        stationId: "stationId2",
        suburbId: suburb.id,
        name: "station name 2",
      });
      await updateReadings();
      const bomReadings = await BomReading.findAll();
      expect(bomReadings.length).toBe(2);
    });

    test("it should not add a reading of the same station and time", async () => {
      await updateReadings();
      const bomReadings = await BomReading.findAll();
      expect(bomReadings.length).toBe(1);
    });

    test("it should add another reading for the same station at a different time", async () => {
      getStationWeatherMock.mockResolvedValueOnce([
        {
          local_date_time_full: "20221026034500",
        },
      ]);
      await updateReadings();
      const bomReadings = await BomReading.findAll();
      expect(bomReadings.length).toBe(2);
    });
  });
});
