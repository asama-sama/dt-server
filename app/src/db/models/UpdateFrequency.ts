import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { AirQualityReading } from "./AirQualityReading";
import { TrafficVolumeReading } from "./TrafficVolumeReading";

export enum Frequency {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  MONTHLY = "MONTHLY",
}

@Table
export class UpdateFrequency extends Model {
  @Column({
    type: DataType.STRING,
    validate: {
      isValidFrequency(value: string) {
        if (!(value in Frequency)) {
          throw new Error(`frequency must be of type Frequency: ${value}`);
        }
      },
    },
    allowNull: false,
    unique: true,
  })
  frequency: string;

  @HasMany(() => TrafficVolumeReading, "updateFrequencyId")
  trafficVolumeReadings: TrafficVolumeReading[];

  @HasMany(() => AirQualityReading, "updateFrequencyId")
  airQualityReadings: AirQualityReading[];
}
