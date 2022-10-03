import { getStations, Station } from "../../src/clients/nswTrafficVolume";
import { APIS } from "../../src/const/api";
import { updateStations } from "../../src/controllers/trafficVolume";
import { Api } from "../../src/db/models/Api";
import { TrafficVolumeStation } from "../../src/db/models/TrafficVolumeStation";

jest.mock("../../src/clients/nswTrafficVolume", () => {
  return {
    __esModule: true,
    getStations: jest.fn(),
    getStationCountsByMonth: jest.fn(),
  };
});

const getStationsMock = getStations as jest.MockedFunction<typeof getStations>;

describe("trafficVolume controller", () => {
  describe("updateStations", () => {
    let api: Api | null;
    beforeEach(async () => {
      api = await Api.findOne({
        where: { name: APIS.nswTrafficVolumeStations.name },
      });
      await TrafficVolumeStation.create({
        lat: 123,
        lng: 321,
        stationId: "100",
        stationKey: "200",
        apiId: api?.id,
      });
    });

    test("it should create new stations", async () => {
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
      expect(stationsCreated.length).toBe(2);
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
          station_id: "100",
          station_key: "2",
          suburb: "test",
        },
      ];
      getStationsMock.mockResolvedValueOnce(stations);
      await updateStations();
      const stationsCreated = await TrafficVolumeStation.findAll({});
      expect(stationsCreated.length).toBe(1);
    });
  });
});
