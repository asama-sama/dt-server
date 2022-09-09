import {
  AirQualityReading,
  AirQualityCategory,
  Frequency,
  PollutantType,
} from "../../../src/db/models/AirQualityReading";
import { AirQualitySite } from "../../../src/db/models/AirQualitySite";

describe("AirQualityReading", () => {
  let site: AirQualitySite;
  beforeEach(async () => {
    site = await AirQualitySite.create({
      siteId: "1234",
    });
  });

  test("it should allow valid airQuality values", async () => {
    Object.values(AirQualityCategory).forEach(async (quality) => {
      await AirQualityReading.create({
        site: site.id,
        airQuality: quality,
      });
    });
  });

  test("it should error on invalid airQuality values", async () => {
    expect(async () => {
      await AirQualityReading.create({
        site: site.id,
        airQuality: "test",
      });
    }).rejects.toThrowError(
      "Validation error: air quality must be of type AirQualityCategory: test"
    );
  });

  test("it should allow valid pollution types", async () => {
    Object.values(PollutantType).forEach(async (pollutant) => {
      await AirQualityReading.create({
        site: site.id,
        type: pollutant,
      });
    });
  });

  test("it should error on invalid pollution types", async () => {
    expect(async () => {
      await AirQualityReading.create({
        site: site.id,
        type: "test",
      });
    }).rejects.toThrowError(
      "Validation error: type must be of type PollutantType: test"
    );
  });

  test("it should allow valid frequency types", async () => {
    Object.values(Frequency).forEach(async (frequency) => {
      await AirQualityReading.create({
        site: site.id,
        frequency: frequency,
      });
    });
  });

  test("it should error on invalid frequency types", async () => {
    expect(async () => {
      await AirQualityReading.create({
        site: site.id,
        frequency: "test",
      });
    }).rejects.toThrowError(
      "Validation error: frequency must be of type Frequency: test"
    );
  });
});
