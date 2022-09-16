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
import { AirQualityReading } from "./AirQualityReading";
import { Api } from "./Api";

@Table
export class AirQualitySite extends Model {
  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api, "apiId")
  api: Api;

  @HasMany(() => AirQualityReading, "airQualitySiteId")
  airQualityReadings: AirQualityReading[];

  @Unique
  @AllowNull(false)
  @Column
  siteId: number;

  @Column
  name: string;

  @Column
  region: string;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  lat: number;

  @AllowNull(false)
  @Column({
    type: DataType.FLOAT,
  })
  lng: number;
}
