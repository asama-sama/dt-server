/// <reference types="@types/jest" />;
import axios from "axios";
import { get, getAggregate } from "../../src/controllers/emissions";
import { loadDataFile } from "../../src/loadDataFiles";
import * as data from "../dataArtifacts/nomanitimErskenvilleResponse.json";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Emissions Controller", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [data] });
  });

  beforeEach(async () => {
    await loadDataFile(
      "ghgEmissionsTest.csv",
      "./tests/dataFiles/ghgEmissionsTest.csv"
    );
  });

  describe("getAggregate", () => {
    test("it should return a record for each suburb", async () => {
      const emissionsAggregate = await getAggregate();
      expect(emissionsAggregate.length).toBe(5);
    });

    test("it should aggregate readings properly", async () => {
      const emissionsAggregate = await getAggregate();
      // sum of values taken from csv
      const newtownSum =
        68244.71853 +
        68908.39248 +
        54931.52831 +
        54068.54675 +
        54696.06236 +
        55336.99239 +
        53578.53209 +
        53180.75656 +
        51178.37261 +
        46997.93624 +
        45562.3611 +
        40245.23203 +
        39443.47605 +
        37247.54129;
      const alexandraSum =
        188840.7789 +
        190536.1108 +
        191218.7798 +
        174280.3064 +
        165054.9838 +
        173738.2726 +
        172959.1008 +
        164401.9306 +
        154240.152 +
        146059.2679 +
        141261.6116 +
        141582.1331 +
        140058.4098 +
        132330.6149 +
        162.7930457 +
        166.6926385 +
        173.041676 +
        179.6901349 +
        185.8203523 +
        190.8888179 +
        200.268868 +
        206.645484 +
        214.5640884 +
        223.7539747 +
        231.7405706 +
        237.6033576;
      const waterlooSum =
        113164.5072 +
        114373.0986 +
        116982.452 +
        118116.8708 +
        126019.6405 +
        127383.99 +
        122351.5475 +
        119867.6207 +
        115779.0855 +
        105289.9222 +
        105014.4864 +
        105171.0369 +
        102774.5535 +
        101267.778;
      const chippendaleSum =
        41542.91183 +
        42016.19676 +
        42573.59712 +
        43125.0469 +
        44039.492 +
        44576.98352 +
        43731.55665 +
        48378.68519 +
        51421.2053 +
        51181.47773 +
        51440.64874 +
        51784.07738 +
        51789.82245 +
        51592.15926 +
        2929.556646 +
        2946.589793 +
        2813.842293 +
        2856.069354 +
        2903.302325 +
        2784.206944 +
        2834.536604 +
        2894.541923 +
        2901.865936 +
        3080.682945 +
        3227.967108 +
        3483.623492 +
        4909.936103 +
        5894.559099;
      const zetlandSum =
        24118.70954 +
        24379.9573 +
        27545.22232 +
        28242.57973 +
        30299.12224 +
        30337.61663 +
        28250.14644 +
        31550.25668 +
        33245.75845 +
        42721.03926 +
        46275.35906 +
        46596.44409 +
        48682.46195 +
        50610.37421;
      for (const agg of emissionsAggregate) {
        expect([
          newtownSum,
          alexandraSum,
          waterlooSum,
          chippendaleSum,
          zetlandSum,
        ]).toContain(agg.suburbAggregateEmission);
      }
    });
  });

  describe("getBySuburb", () => {
    test("it should group emissions by suburb", async () => {
      const emissionsBySuburb = await get();
      expect(emissionsBySuburb.emissions.length).toBeGreaterThan(0);
    });
  });
});
