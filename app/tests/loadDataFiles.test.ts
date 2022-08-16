/// <reference types="@types/jest" />;
import { loadDataFiles } from "../../app/src/loadDataFiles";
import { Emission } from "../src/db/models/Emission";
import { Suburb } from "../src/db/models/Suburb";
import { Category } from "../src/db/models/Category";

describe("loadDataFiles", () => {
  beforeEach(async () => {
    await loadDataFiles();
  });

  test("correct number of suburbs loaded", async () => {
    const SUBURB_LIST = [
      "Newtown + St Peters",
      "Alexandria",
      "Waterloo + Moore Park",
      "Chippendale",
      "Zetland",
    ];
    const suburbs = await Suburb.findAll();
    expect(suburbs.length).toBe(5);
    suburbs.forEach((suburb) => {
      expect(SUBURB_LIST).toContain(suburb.name);
    });
  });

  test("correct number of categories loaded", async () => {
    const CATEGORY_LIST = [
      "Electricity (Disaggregated)",
      "Waste Water (Disaggregated)",
      "Gas (Disaggregated)",
    ];
    const categories = await Category.findAll();
    expect(categories.length).toBe(3);
    categories.forEach((category) => {
      expect(CATEGORY_LIST).toContain(category.name);
    });
  });

  test("correct number of emissions loaded", async () => {
    const emissions = await Emission.findAll();
    expect(emissions.length).toBe(14 * 7);
    emissions.forEach((emission) => {
      expect(emission.reading).not.toBeNaN();
    });
  });
});
