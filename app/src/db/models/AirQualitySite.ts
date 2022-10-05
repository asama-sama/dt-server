import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType,
  Unique,
  HasMany,
} from "sequelize-typescript";
import { AirQualityReading } from "./AirQualityReading";
import { DataSource } from "./DataSource";

@Table
export class AirQualitySite extends Model {
  @ForeignKey(() => DataSource)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  api: DataSource;

  @HasMany(() => AirQualityReading, "airQualitySiteId")
  airQualityReadings: AirQualityReading[];

  @Unique
  @AllowNull(false)
  @Column
  siteId: number;

  @Column
  name: string;

  @Column
  region: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  lat: number;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  lng: number;
}
