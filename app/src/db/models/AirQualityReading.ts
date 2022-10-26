import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { UpdateFrequency } from "./UpdateFrequency";
import { AirQualitySite } from "./AirQualitySite";
import { DataSource } from "./DataSource";

export enum AirQualityCategory {
  "GOOD" = "GOOD",
  "FAIR" = "FAIR",
  "POOR" = "POOR",
  "VERY POOR" = "VERY POOR",
  "EXTREMELY POOR" = "EXTREMELY POOR",
}

export enum AirQualityType {
  "NO2" = "NO2",
  "CO2" = "CO2",
  "TEMP" = "TEMP",
  "WSP" = "WSP",
  "WDR" = "WDR",
}

@Table
export class AirQualityReading extends Model {
  @ForeignKey(() => AirQualitySite)
  @AllowNull(false)
  @Column
  airQualitySiteId: number;

  @BelongsTo(() => AirQualitySite, "airQualitySiteId")
  airQualitySite: AirQualitySite;

  @ForeignKey(() => DataSource)
  @AllowNull(false)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @ForeignKey(() => UpdateFrequency)
  @AllowNull(false)
  @Column
  updateFrequencyId: number;

  @BelongsTo(() => UpdateFrequency, "updateFrequencyId")
  updateFrequency: UpdateFrequency;

  @AllowNull(false)
  @Column
  date: Date;

  @AllowNull(false)
  @Column
  hour: number;

  @Column({
    type: DataType.FLOAT,
  })
  value: number | null;

  @Column({
    type: DataType.STRING,
    validate: {
      isValidQuality(value: string) {
        if (!(value in AirQualityCategory)) {
          throw new Error(
            `air quality must be of type AirQualityCategory: ${value}`
          );
        }
      },
    },
  })
  airQualityCategory: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isValidType(value: string) {
        if (!(value in AirQualityType)) {
          throw new Error(`type must be of type AirQualityType: ${value}`);
        }
      },
    },
    allowNull: false,
  })
  type: string;
}
