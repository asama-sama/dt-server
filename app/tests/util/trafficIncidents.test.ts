/// <reference types="@types/jest" />;
import { TrafficIncidentCategory } from "../../src/db/models/TrafficIncidentCategory";
import {
  getTrafficIncidentCategory,
  updateTrafficIncidentCategories,
} from "../../src/util/trafficIncidents";

describe("traffic incident utils", () => {
  describe("getTrafficIncidentCategory", () => {
    test('it should find the correct category for "holiday"', () => {
      const category = getTrafficIncidentCategory("holiday");
      expect(category).toEqual("heavy traffic".toUpperCase());
    });

    test('it should find the correct category for "crash"', () => {
      const category = getTrafficIncidentCategory("crash");
      expect(category).toEqual("crash".toUpperCase());
    });

    test('it should find the correct category for "really bad flooding"', () => {
      const category = getTrafficIncidentCategory("really bad flooding");
      expect(category).toEqual("weather-fire-disasters".toUpperCase());
    });

    test("it shouldn't find the category for getTrafficIncidentCategory", () => {
      const category = getTrafficIncidentCategory("abc123");
      expect(category).toEqual(null);
    });
  });

  describe("updateTrafficIncidentCategories", () => {
    test("it should set the category if it is null", async () => {
      await TrafficIncidentCategory.create({
        subcategory: "fire",
      });
      await updateTrafficIncidentCategories();
      const trafficIncidentCategory = await TrafficIncidentCategory.findOne({
        where: { subcategory: "FIRE" },
      });
      expect(trafficIncidentCategory?.category).toBe("WEATHER-FIRE-DISASTERS");
    });
    test("it should not set change the category from null if the subcategory is not linked to a category", async () => {
      await TrafficIncidentCategory.create({
        subcategory: "testsubcategory",
      });
      await updateTrafficIncidentCategories();
      const trafficIncidentCategory = await TrafficIncidentCategory.findOne({
        where: { subcategory: "TESTSUBCATEGORY" },
      });
      expect(trafficIncidentCategory?.category).toBeNull();
    });
  });
});
