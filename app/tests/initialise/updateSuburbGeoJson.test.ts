/// <reference types="@types/jest" />;
import axios from "axios";
import { updateSuburbGeoJson } from "../../src/initialise/updateSuburbGeoJson";
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
