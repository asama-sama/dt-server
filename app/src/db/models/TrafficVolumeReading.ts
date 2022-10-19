import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { TrafficVolumeStation } from "./TrafficVolumeStation";
import { DataSource } from "./DataSource";
import { UpdateFrequency } from "./UpdateFrequency";

@Table
export class TrafficVolumeReading extends Model {
  @AllowNull(false)
  @Column
  year: number;

  @AllowNull(false)
  @Column
  month: number;

  @Column
  day: number;

  @Column
  value: number;

  @ForeignKey(() => TrafficVolumeStation)
  @Column
  trafficVolumeStationId: number;

  @BelongsTo(() => TrafficVolumeStation, "trafficVolumeStationId")
  station: TrafficVolumeStation;

  @ForeignKey(() => DataSource)
  @AllowNull(false)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @ForeignKey(() => UpdateFrequency)
  @AllowNull(false)
  @Column
  updateFrequencyId: number;

  @BelongsTo(() => UpdateFrequency, "updateFrequencyId")
  updateFrequency: UpdateFrequency;
}
