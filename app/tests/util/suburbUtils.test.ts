/// <reference types="@types/jest" />;
import axios from "axios";
import {
  updateSuburbGeoJson,
  transformSuburbNames,
  parseSuburbNames,
} from "../../src/util/suburbUtils";
import { Suburb } from "../../src/db/models/Suburb";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("updateSuburbGeoJson", () => {
  beforeAll(() => {
    mockedAxios.get.mockResolvedValue({ data: [{ geoJson: "geodata" }] });
  });

  test("it should set geodata json in suburb properly", async () => {
    const suburbNames = ["s1", "s2", "s3 + s4"];

    await Suburb.bulkCreate(
      suburbNames.map((name) => ({
        name,
        shapeArea: 1,
        shapeLength: 2,
      }))
    );
    await updateSuburbGeoJson();
    const suburbs = await Suburb.findAll();
    expect(suburbs[0].geoData).toMatchObject({ S1: { geoJson: "geodata" } });
    expect(suburbs[1].geoData).toMatchObject({ S2: { geoJson: "geodata" } });
    expect(suburbs[2].geoData).toMatchObject({
      S3: { geoJson: "geodata" },
      S4: { geoJson: "geodata" },
    });
  });

  test("it should only fetch data for suburbs that don't have geojson set", async () => {
    const suburbNames = ["s1", "s2 + s3", "s3", "s5"];

    await Suburb.bulkCreate(
      suburbNames.map((name, i) => ({
        name,
        shapeArea: 1,
        shapeLength: 2,
        geoData: i % 2 === 0 ? { dataHere: "data" } : null,
      }))
    );
    await updateSuburbGeoJson();
    const suburbs = await Suburb.findAll({
      order: [["id", "ASC"]],
    });
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(suburbs[0].geoData).toMatchObject({
      dataHere: "data",
    });
    expect(suburbs[1].geoData).toMatchObject({
      S2: { geoJson: "geodata" },
      S3: { geoJson: "geodata" },
    });
    expect(suburbs[2].geoData).toMatchObject({
      dataHere: "data",
    });
    expect(suburbs[3].geoData).toMatchObject({
      S5: { geoJson: "geodata" },
    });
  });
});

describe("transformSuburbNames", () => {
  test("it changes the name to be uppercase", () => {
    const name = "suburb name";
    const transformedName = transformSuburbNames(name);
    expect(transformedName).toBe("SUBURB NAME");
  });

  test('it replaces "TO" with "+"', () => {
    const name = "suburb1 to suburb2";
    const transformedName = transformSuburbNames(name);
    expect(transformedName).toBe("SUBURB1 + SUBURB2");
  });

  test('it replaces "-" with "+"', () => {
    const name = "suburb1 - suburb2";
    const transformedName = transformSuburbNames(name);
    expect(transformedName).toBe("SUBURB1 + SUBURB2");
  });

  test('it replaces "-" with "+"', () => {
    const name = "suburb1- suburb2";
    const transformedName = transformSuburbNames(name);
    expect(transformedName).toBe("SUBURB1 + SUBURB2");
  });

  test('it replaces "-" with "+"', () => {
    const name = "suburb1-suburb2";
    const transformedName = transformSuburbNames(name);
    expect(transformedName).toBe("SUBURB1 + SUBURB2");
  });
});

describe.only("parseSuburbNames", () => {
  test('it parses "suburb" correctly', () => {
    const suburbs = parseSuburbNames("suburb");
    expect(suburbs).toMatchObject(["SUBURB"]);
  });

  test('it parses "suburb1 + suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1 + suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1+ suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1+ suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1 +suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1 +suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1+suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1+suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1 to suburb2 correctly', () => {
    const suburbs = parseSuburbNames("suburb1 to suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it does not split "subtoburb', () => {
    const suburbs = parseSuburbNames("subtoburb");
    expect(suburbs).toMatchObject(["SUBTOBURB"]);
  });
});
