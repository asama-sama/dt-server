/// <reference types="@types/jest" />;
import axios from "axios";
import { getStations, WeatherStation } from "../../src/clients/bom";

const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({
  data: `<tr class="rowleftcolumn">
<th ><a href="/products/IDN11111/IDN11111.11111.shtml">test 1</a></th>
<th ><a href="/products/IDN22222/IDN22222.22222.shtml">test 2</a></th>
<th ><a href="/products/IDN333333/IDN333333.33333.shtml">test 3</a></th>
</tr>`,
});

describe("bom", () => {
  let stations: WeatherStation[];
  beforeEach(async () => {
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
