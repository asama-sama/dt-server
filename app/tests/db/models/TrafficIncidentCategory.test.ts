/// <reference types="@types/jest" />;
import { TrafficIncidentCategory } from "../../../src/db/models/TrafficIncidentCategory";
describe("TrafficIncidentCategory", () => {
  test("it should create a TrafficIncidentCategory", async () => {
    const trafficIncidentCategory = await TrafficIncidentCategory.create({
      subcategory: "test",
    });
    expect(trafficIncidentCategory).not.toBeNull();
  });
  test("it should set the subcategory as upper case", async () => {
    const trafficIncidentCategory = await TrafficIncidentCategory.create({
      subcategory: "test",
    });
    expect(trafficIncidentCategory.subcategory).toBe("TEST");
  });

  test("it should set category as upper case", async () => {
    const trafficIncidentCategory = await TrafficIncidentCategory.create({
      subcategory: "test",
      category: "category",
    });
    expect(trafficIncidentCategory.category).toBe("CATEGORY");
  });
});
