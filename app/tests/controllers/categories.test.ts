/// <reference types="@types/jest" />;
import { Category } from "../../src/db/models/Category";
import { getEmissionsByCategory } from "../../src/controllers/categories";
import { loadDataFile } from "../../src/initialise/loadDataFiles";

describe("categories", () => {
  test("it should get all categories", async () => {
    await Category.bulkCreate([
      {
        name: "c1",
      },
      {
        name: "c2",
      },
      {
        name: "c3",
      },
    ]);
    const categories = await Category.findAll({});
    expect(categories.length).toBe(3);
  });

  describe("getEmissionsByCateogry", () => {
    beforeEach(async () => {
      await loadDataFile(
        "ghgEmissionsTest.csv",
        "./tests/dataFiles/ghgEmissionsTest.csv"
      );
    });
    test("it should return the correct number of categories", async () => {
      const emissions = await getEmissionsByCategory();
      expect(emissions.length).toBe(3);
    });
    test("it should return the correct readings for each category", async () => {
      const emissions = await getEmissionsByCategory();
      expect(emissions).toMatchObject([
        { categoryId: 3, reading: 1640017.8703649996 },
        { categoryId: 2, reading: 1218850.9996985998 },
        { categoryId: 1, reading: 5745788.400319999 },
      ]);
    });
  });
});
