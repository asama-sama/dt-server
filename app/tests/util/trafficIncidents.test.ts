/// <reference types="@types/jest" />;
import { getTrafficIncidentCategory } from "../../src/util/trafficIncidents";

describe("getTrafficIncidentCategory", () => {
  test('it should find the correct category for "holiday"', () => {
    const category = getTrafficIncidentCategory("holiday");
    expect(category).toEqual("heavy traffic");
  });

  test('it should find the correct category for "crash"', () => {
    const category = getTrafficIncidentCategory("crash");
    expect(category).toEqual("crash");
  });

  test('it should find the correct category for "really bad flooding"', () => {
    const category = getTrafficIncidentCategory("really bad flooding");
    expect(category).toEqual("weather-fire-disasters");
  });

  test("it shouldn't find the category for getTrafficIncidentCategory", () => {
    const category = getTrafficIncidentCategory("abc123");
    expect(category).toEqual("uncategorised");
  });
});
