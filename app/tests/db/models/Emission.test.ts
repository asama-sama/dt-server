import { Emission } from "../../../src/db/models/Emission";
import { Suburb } from "../../../src/db/models/Suburb";
import { Category } from "../../../src/db/models/Category";

describe("Emission", () => {
  test("creates and has relations to suburb and category", async () => {
    const suburb = await Suburb.create({
      name: "s1",
      shapeArea: 23.234,
      shapeLength: 5.5,
    });

    const category = await Category.create({ name: "c1" });

    const e = await Emission.create(
      {
        reading: 4356.2344,
        suburbId: suburb.id,
        categoryId: category.id,
      },
      { include: [Category, Suburb] }
    );
    const emission = await Emission.findOne({
      where: e.id,
      include: [Category, Suburb],
    });
    expect(emission).toMatchObject({
      reading: 4356.2344,
      suburb: {
        name: suburb.name,
        shapeArea: suburb.shapeArea,
        shapeLength: suburb.shapeLength,
      },
      category: {
        name: category.name,
      },
    });
  });

  test("creates correct emission readings", async () => {
    const READINGS = [3, 5842.23498239, 0, "", -12.23232];
    const suburb = await Suburb.create({
      name: "s1",
      shapeArea: 23.234,
      shapeLength: 5.5,
    });

    const category = await Category.create({ name: "c1" });

    for (const reading of READINGS) {
      const e = await Emission.create({
        reading,
        suburbId: suburb.id,
        categoryId: category.id,
      });
      expect(e.reading).toBe(reading || 0);
    }
  });
});
