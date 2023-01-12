/// <reference types="@types/jest" />;
import axios from "axios";
import {
  getStations,
  getStationWeather,
  WeatherStation,
} from "../../src/clients/bom";
import { BomStation } from "../../src/db/models/BomStation";
import { DataSource } from "../../src/db/models/DataSource";
import { Suburb } from "../../src/db/models/Suburb";
import bomStationWeatherResponse from "../dataArtifacts/bomStationWeatherResponse.json";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("bom", () => {
  describe("getStations", () => {
    let stations: WeatherStation[];
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: `<tr class="rowleftcolumn">
      <th ><a href="/products/IDN11111/IDN11111.11111.shtml">test 1</a></th>
      <th ><a href="/products/IDN22222/IDN22222.22222.shtml">test 2</a></th>
      <th ><a href="/products/IDN333333/IDN333333.33333.shtml">test 3</a></th>
      </tr>`,
      });
      stations = await getStations();
    });
    test("it should make a uri call", () => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    test("it should have the correct result", () => {
      expect(stations).toMatchObject([
        {
          id: "IDN11111/IDN11111.11111",
          name: "test 1",
        },
        {
          id: "IDN22222/IDN22222.22222",
          name: "test 2",
        },
        {
          id: "IDN333333/IDN333333.33333",
          name: "test 3",
        },
      ]);
    });
  });
  describe("getStationWeather", () => {
    let station: BomStation;
    beforeEach(async () => {
      const suburb = await Suburb.create({
        name: "suburb1",
      });
      const dataSource = await DataSource.create({
        name: "ds1",
      });
      station = await BomStation.create({
        stationId: "test/station",
        name: "station name",
        suburbId: suburb.id,
        dataSourceId: dataSource.id,
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: bomStationWeatherResponse,
      });
    });

    test("it should make a uri call to the correct address", async () => {
      await getStationWeather(station);
      expect(axios.get).toHaveBeenCalledWith(
        "http://www.bom.gov.au/fwo/test/station.json"
      );
    });

    test("it should return the observations", async () => {
      const res = await getStationWeather(station);
      expect(Array.isArray(res)).toBe(true);
      for (const observation of res) {
        expect(observation).toMatchObject({
          wind_dir: expect.any(String),
          wind_spd_kmh: expect.any(Number),
          wind_spd_kt: expect.any(Number),
          gust_kmh: expect.any(Number),
          gust_kt: expect.any(Number),
          air_temp: expect.any(Number),
        });
      }
    });
  });
});
