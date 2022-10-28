import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { BomStation } from "./BomStation";
import { DataSource } from "./DataSource";

@Table
export class BomReading extends Model {
  @ForeignKey(() => BomStation)
  @AllowNull(false)
  @Column
  bomStationId: number;

  @BelongsTo(() => BomStation, "bomStationId")
  bomStation: BomStation;

  @ForeignKey(() => DataSource)
  @AllowNull(false)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @AllowNull(false)
  @Column
  time: Date;

  @Column({
    type: DataType.FLOAT,
  })
  airTemp_c: number;

  @Column
  cloud_oktas: number;

  @Column
  gust_kmh: number;

  @Column({
    type: DataType.FLOAT,
  })
  dewPoint_c: number;

  @Column({
    type: DataType.FLOAT,
  })
  pressure_hpa: number;

  @Column({
    type: DataType.FLOAT,
  })
  rainSince9am_mm: number;

  @Column
  relHumidity_perc: number;

  @Column
  windDir: string;

  @Column
  windSpd_kmh: number;
}
