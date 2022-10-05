import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
  Unique,
} from "sequelize-typescript";
import { DataSource } from "./DataSource";
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
  @Column
  lat: number;

  @AllowNull(false)
  @Column
  lng: number;

  @Column
  name: string;

  @Column
  suburb: string;

  @Column
  lga: string;

  @Column
  rmsRegion: string;

  @Column
  postCode: string;
}
