/// <reference types="@types/jest" />;
import { Suburb } from "../../../src/db/models/Suburb";

describe("Suburb", () => {
  test("", async () => {
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
});
