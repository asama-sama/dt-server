/// <reference types="@types/jest" />;
import { Suburb } from "../../../src/db/models/Suburb";

describe("Suburb", () => {
  test("it should create a suburb object in the database", async () => {
    const s = await Suburb.create({
      name: "test",
      shapeArea: 234.345,
      shapeLength: 554.435346,
    });
    expect(s).toMatchObject({
      name: "test",
      shapeArea: 234.345,
      shapeLength: 554.435346,
    });
  });

  test("it should create geojson correctly", async () => {
    const geoJson = {
      type: "Polygon",
      coordinates: [
        [
          [150.260825, -33.71567],
          [150.273246, -33.717359],
          [150.274296, -33.711783],
          [150.274552, -33.71047],
          [150.284644, -33.711767],
          [150.285109, -33.709325],
          [150.285149, -33.709331],
          [150.285192, -33.709331],
          [150.285222, -33.709334],
          [150.285251, -33.709339],
          [150.285279, -33.709346],
        ],
      ],
    };
    const s = await Suburb.create({
      name: "test",
      geoJson,
    });
    expect(s.geoJson).toEqual(geoJson);
  });
});
