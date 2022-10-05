import {
  AirQualityReading,
  AirQualityCategory,
  PollutantType,
} from "../../../src/db/models/AirQualityReading";
import {
  Frequency,
  UpdateFrequency,
} from "../../../src/db/models/UpdateFrequency";
import { AirQualitySite } from "../../../src/db/models/AirQualitySite";
import { DataSource } from "../../../src/db/models/DataSource";
import { APIS } from "../../../src/const/api";

describe("AirQualityReading", () => {
  let site: AirQualitySite;
  let dataSource: DataSource | null;
  let updateFrequency: UpdateFrequency | null;
  beforeEach(async () => {
    site = await AirQualitySite.create({
      siteId: "1234",
      lat: 20,
      lng: 40,
    });
    dataSource = await DataSource.findOne({
      where: { name: APIS.nswAirQualityReadings.name },
    });
    updateFrequency = await UpdateFrequency.findOne({
      where: { frequency: Frequency.DAILY },
    });
  });

  test("it should allow valid airQuality values", async () => {
    Object.values(AirQualityCategory).forEach(async (quality) => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        airQualityCategory: quality,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
      });
    });
  });

  test("it should error on invalid airQuality values", async () => {
    expect(async () => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        airQualityCategory: "test",
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
      });
    }).rejects.toThrowError(
      "Validation error: air quality must be of type AirQualityCategory: test"
    );
  });

  test("it should allow valid pollution types", async () => {
    Object.values(PollutantType).forEach(async (pollutant) => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        type: pollutant,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
      });
    });
  });

  test("it should error on invalid pollution types", async () => {
    expect(async () => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        type: "test",
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
      });
    }).rejects.toThrowError(
      "Validation error: type must be of type PollutantType: test"
    );
  });

  test("it should allow valid frequency types", async () => {
    Object.values(Frequency).forEach(async (frequency) => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        frequency: frequency,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
      });
    });
  });
});
