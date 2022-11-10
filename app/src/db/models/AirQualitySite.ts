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
import { Point } from "../../customTypes/geometry";
import { AirQualityReading } from "./AirQualityReading";
import { DataSource } from "./DataSource";
import { Suburb } from "./Suburb";

@Table
export class AirQualitySite extends Model {
  @ForeignKey(() => DataSource)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @HasMany(() => AirQualityReading, "airQualitySiteId")
  airQualityReadings: AirQualityReading[];

  @Unique
  @AllowNull(false)
  @Column
  siteId: number;

  @Column
  region: string;

  @AllowNull(false)
  @Column(DataType.GEOMETRY)
  position: Point;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;
}
