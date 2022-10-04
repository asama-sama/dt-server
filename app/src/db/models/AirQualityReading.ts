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
  "CO2" = "CO2",
}

@Table
export class AirQualityReading extends Model {
  @ForeignKey(() => AirQualitySite)
  @AllowNull(false)
  @Column
  airQualitySiteId: number;

  @BelongsTo(() => AirQualitySite, "airQualitySiteId")
  airQualitySite: AirQualitySite;

  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api, "apiId")
  api: Api;

  @Column
  date: Date;

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
        if (!(value in PollutantType)) {
          throw new Error(`type must be of type PollutantType: ${value}`);
        }
      },
    },
  })
  type: string;

  @ForeignKey(() => UpdateFrequency)
  @AllowNull(false)
  @Column
  updateFrequencyId: number;

  @BelongsTo(() => UpdateFrequency, "updateFrequencyId")
  updateFrequency: UpdateFrequency;
}