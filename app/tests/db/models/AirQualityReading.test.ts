/// <reference types="@types/jest" />;
import {
  AirQualityReading,
  AirQualityCategory,
  AirQualityType,
} from "../../../src/db/models/AirQualityReading";
import {
  Frequency,
  UpdateFrequency,
} from "../../../src/db/models/UpdateFrequency";
import { AirQualitySite } from "../../../src/db/models/AirQualitySite";
import { DataSource } from "../../../src/db/models/DataSource";
import { DATASOURCES } from "../../../src/const/datasource";

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
      where: { name: DATASOURCES.nswAirQualityReadings.name },
    });
    updateFrequency = await UpdateFrequency.findOne({
      where: { frequency: Frequency.DAILY },
    });
  });

  test("it should allow valid airQuality values", async () => {
    for (const quality of Object.values(AirQualityCategory)) {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        airQualityCategory: quality,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
        date: new Date(),
        hour: 0,
        type: AirQualityType.NO2,
      });
    }
  });

  test("it should error on invalid airQuality values", async () => {
    await expect(async () => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        airQualityCategory: "test",
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
        date: new Date(),
        hour: 0,
        type: AirQualityType.NO2,
      });
    }).rejects.toThrowError(
      "Validation error: air quality must be of type AirQualityCategory: test"
    );
  });

  test("it should allow valid pollution types", async () => {
    for (const pollutant of Object.values(AirQualityType)) {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        type: pollutant,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
        date: new Date(),
        hour: 0,
      });
    }
  });

  test("it should error on invalid pollution types", async () => {
    await expect(async () => {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        type: "test",
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
        date: new Date(),
        hour: 0,
      });
    }).rejects.toThrowError(
      "Validation error: type must be of type AirQualityType: test"
    );
  });

  test("it should allow valid frequency types", async () => {
    for (const frequency of Object.values(Frequency)) {
      await AirQualityReading.create({
        airQualitySiteId: site.id,
        frequency: frequency,
        dataSourceId: dataSource?.id,
        updateFrequencyId: updateFrequency?.id,
        date: new Date(),
        hour: 0,
        type: AirQualityType.NO2,
      });
    }
  });
});
