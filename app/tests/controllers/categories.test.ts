/// <reference types="@types/jest" />;
import { Category } from "../../src/db/models/Category";

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
});
