import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
  Unique,
  DataType,
} from "sequelize-typescript";
import { Point } from "../../customTypes/geometry";
import { DataSource } from "./DataSource";
import { Suburb } from "./Suburb";
import { TrafficVolumeReading } from "./TrafficVolumeReading";

@Table
export class TrafficVolumeStation extends Model {
  @ForeignKey(() => DataSource)
  @AllowNull(false)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @HasMany(() => TrafficVolumeReading, "trafficVolumeStationId")
  trafficVolumeReadings: TrafficVolumeReading[];

  @Unique
  @AllowNull(false)
  @Column
  stationKey: string;

  @Unique
  @AllowNull(false)
  @Column
  stationId: string;

  @AllowNull(false)
  @Column(DataType.GEOMETRY)
  position: Point;

  @Column
  name: string;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;

  @Column
  lga: string;

  @Column
  rmsRegion: string;

  @Column
  postCode: string;
}
