/// <reference types="@types/jest" />;
import { getStations, WeatherStation } from "../../src/clients/bom";
import { updateStations } from "../../src/controllers/bom";
jest.mock("../../src/clients/bom", () => ({
  __esModule: true,
  getStations: jest.fn(),
}));

const getStationsMock = getStations as jest.MockedFunction<typeof getStations>;

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

    test("it should set lat lng on station");

    test("it should add the reading");

    test("it should add a reading at the same time but different station");

    test("it should not add a reading of the same station and time");
  });
});
