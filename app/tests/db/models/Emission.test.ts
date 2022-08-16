/// <reference types="@types/jest" />;
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
});
