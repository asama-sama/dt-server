import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { AirQualitySite } from "./AirQualitySite";
import { Api } from "./Api";

export enum AirQualityCategory {
  "GOOD" = "GOOD",
  "FAIR" = "FAIR",
  "POOR" = "POOR",
  "VERY POOR" = "VERY POOR",
  "EXTREMELY POOR" = "EXTREMELY POOR",
}

export enum PollutantType {
  "NO2" = "NO2",
}

export enum Frequency {
  HOURLY = "HOURLY",
  MONTHLY = "MONTHLY",
}

@Table
export class AirQualityReading extends Model {
  @ForeignKey(() => AirQualitySite)
  @Column
  siteId: number;

  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api)
  api: Api;

  @Column
  date: Date;

  @Column
  hour: number;

  @Column
  value: number;

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
  airQuality: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isValidType(value: string) {
        if (!(value in PollutantType)) {
          throw new Error(`type must be of type PollutantType: ${value}`);
        }
      },
    },
  })
  type: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isValidFrequency(value: string) {
        if (!(value in Frequency)) {
          throw new Error(`frequency must be of type Frequency: ${value}`);
        }
      },
    },
  })
  frequency: string;

  @BelongsTo(() => AirQualitySite)
  site: AirQualitySite;
}
