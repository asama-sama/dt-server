import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { TrafficVolumeStation } from "./TrafficVolumeStation";
import { Api } from "./Api";

@Table
export class TrafficVolumeReading extends Model {
  @AllowNull(false)
  @Column
  year: number;

  @AllowNull(false)
  @Column
  month: number;

  @AllowNull(false)
  @Column
  day: number;

  @Column
  value: number;

  @ForeignKey(() => TrafficVolumeStation)
  @Column
  trafficVolumeStationId: number;

  @BelongsTo(() => TrafficVolumeStation, "trafficVolumeStationId")
  station: TrafficVolumeStation;

  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api, "apidId")
  api: Api;
}
