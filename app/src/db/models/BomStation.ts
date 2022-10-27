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
import { BomWeatherReading } from "./BomReading";
import { DataSource } from "./DataSource";
import { Suburb } from "./Suburb";

@Table
export class BomStation extends Model {
  @AllowNull(false)
  @Column
  stationId: string;

  @ForeignKey(() => Suburb)
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

  @Column({
    type: DataType.FLOAT,
  })
  lat: number;

  @Column({
    type: DataType.FLOAT,
  })
  lng: number;

  @HasMany(() => BomWeatherReading, "bomStationid")
  bomWeatherReadings: BomWeatherReading[];
}
