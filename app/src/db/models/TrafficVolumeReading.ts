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
  @ForeignKey(() => TrafficVolumeStation)
  @Column
  siteId: number;

  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

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

  @BelongsTo(() => TrafficVolumeStation)
  station: TrafficVolumeStation;

  @BelongsTo(() => Api)
  api: Api;
}
