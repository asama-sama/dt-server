/// <reference types="@types/jest" />;
import axios from "axios";
import { getStations } from "../../src/clients/nswTrafficVolume";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("nswTrafficVolume client", () => {
  describe("getDailyStationCounts", () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          rows: [
            {
              date: "2022-08-01",
              stationKey: "10",
              count: 5,
            },
            {
              date: "2022-08-02",
              stationKey: "20",
              count: 15,
            },
          ],
        },
      });
    });

    it("it should map the incoming objects to the correct keys", async () => {
      const stations = await getStations();
      expect(stations).toMatchObject([
        {
          date: "2022-08-01",
          stationKey: "10",
          count: 5,
        },
        {
          date: "2022-08-02",
          stationKey: "20",
          count: 15,
        },
      ]);
    });
  });
});
