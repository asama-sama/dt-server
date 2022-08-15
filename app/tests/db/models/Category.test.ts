import { Category } from "../../../src/db/models/Category";

describe("Category", () => {
  test("", async () => {
    const category = await Category.create({
      name: "testCategory",
    });
    expect(category).toMatchObject({
      name: "testCategory",
    });
  });
});
