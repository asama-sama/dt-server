/// <reference types="@types/jest" />;
import { bulkSearch } from "../../src/clients/nominatim";
import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

const viewbox = { lon1: 0, lat1: 0, lon2: 0, lat2: 0 };

describe("nominatim", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [{ boundary: "boundary" }] });
  });

  // TODO: change tests to use throttle timer
  test("it should throttle requests", async () => {
    process.env.NOMINATIM_API_TIMEOUT = "500";

    const queries = [
      { name: "q1", viewbox },
      { name: "q2", viewbox },
    ];
    const startTime = Date.now();
    await bulkSearch(queries, jest.fn(), jest.fn());
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    expect(endTime - startTime).toBeLessThanOrEqual(1500);

    process.env.NOMINATIM_API_TIMEOUT = "0";
  });

  test("it should hit the api the correct number of times", async () => {
    const queries = [
      { name: "q1", viewbox },
      { name: "q2", viewbox },
      { name: "q3", viewbox },
    ];
    await bulkSearch(queries, jest.fn(), jest.fn());
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test("it should call the callback function if the return type is correct", async () => {
    const callbackMock = jest.fn();
    mockedAxios.get.mockResolvedValue({
      data: [{ geojson: { type: "point" } }, { geojson: { type: "Polygon" } }],
    });
    await bulkSearch([{ name: "q1", viewbox }], callbackMock, jest.fn());
    expect(callbackMock).toHaveBeenCalledWith(
      { geojson: { type: "Polygon" } },
      "q1"
    );
  });

  test("it should not call the callback function if there are no valid types", async () => {
    const callbackMock = jest.fn();
    mockedAxios.get.mockResolvedValue({
      data: [{ boundary: { type: "none" } }],
    });
    await bulkSearch([{ name: "q1", viewbox }], callbackMock, jest.fn());
    expect(callbackMock).not.toHaveBeenCalled();
  });
});
