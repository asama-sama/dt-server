import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Point } from "../../customTypes/geometry";
import { BomReading } from "./BomReading";
import { DataSource } from "./DataSource";
import { Suburb } from "./Suburb";

@Table
export class BomStation extends Model {
  @AllowNull(false)
  @Column
  stationId: string;

  @ForeignKey(() => Suburb)
  @AllowNull(false)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;

  @ForeignKey(() => DataSource)
  @AllowNull(false)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.GEOMETRY)
  position: Point;

  @HasMany(() => BomReading, "bomStationid")
  bomReadings: BomReading[];
}
