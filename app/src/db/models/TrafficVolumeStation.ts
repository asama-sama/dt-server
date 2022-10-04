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
import { Api } from "./Api";
import { TrafficVolumeReading } from "./TrafficVolumeReading";

@Table
export class TrafficVolumeStation extends Model {
  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api, "apiId")
  api: Api;

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
