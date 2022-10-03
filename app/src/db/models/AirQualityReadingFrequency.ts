import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum Frequency {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  MONTHLY = "MONTHLY",
}

@Table
export class AirQualityReadingFrequency extends Model {
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
}
