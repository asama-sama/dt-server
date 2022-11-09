/// <reference types="@types/jest" />;
import { bulkSearch } from "../../src/clients/nominatim";
import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

const viewbox = { lon1: 0, lat1: 0, lon2: 0, lat2: 0 };

describe("nominatim", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [{ geoJson: "geodata" }] });
  });

  test("it should throttle requests", async () => {
    process.env.NOMINATIM_API_TIMEOUT = "500";

    const queries = [
      { name: "q1", state: "state", viewbox },
      { name: "q2", state: "state", viewbox },
    ];
    const startTime = Date.now();
    await bulkSearch(queries, async () => {
      return;
    });
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    expect(endTime - startTime).toBeLessThanOrEqual(1500);

    process.env.NOMINATIM_API_TIMEOUT = "0";
  });

  test("it should hit the api the correct number of times", async () => {
    const queries = [
      { name: "q1", state: "state", viewbox },
      { name: "q2", state: "state", viewbox },
      { name: "q3", state: "state", viewbox },
    ];
    await bulkSearch(queries, async () => {
      return;
    });
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test("it should call the callback function if the return type is correct", async () => {
    const callbackMock = jest.fn();
    mockedAxios.get.mockResolvedValue({
      data: [{ geojson: { type: "point" } }, { geojson: { type: "Polygon" } }],
    });
    await bulkSearch([{ name: "q1", state: "state", viewbox }], callbackMock);
    expect(callbackMock).toHaveBeenCalledWith(
      { geojson: { type: "Polygon" } },
      "q1"
    );
  });

  test("it should not call the callback function if there are no valid types", async () => {
    const callbackMock = jest.fn();
    mockedAxios.get.mockResolvedValue({
      data: [{ geojson: { type: "none" } }],
    });
    await bulkSearch([{ name: "q1", state: "state", viewbox }], callbackMock);
    expect(callbackMock).not.toHaveBeenCalled();
  });
});
