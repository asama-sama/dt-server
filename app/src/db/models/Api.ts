import {
  Table,
  Column,
  Model,
  Default,
  HasMany,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { ApiUpdateLog } from "./ApiUpdateLog";
import { AirQualityReading } from "./AirQualityReading";
import { AirQualitySite } from "./AirQualitySite";
import { TrafficVolumeReading } from "./TrafficVolumeReading";
import { TrafficVolumeStation } from "./TrafficVolumeStation";

@Table
export class Api extends Model {
  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  uri: string;

  @Column({
    type: DataType.STRING(1000),
  })
  queryStringParams: string;

  @Default(false)
  @Column
  historicalFetched: boolean;

  @HasMany(() => ApiUpdateLog, "apiId")
  apiUpdateLogs: ApiUpdateLog[];

  @HasMany(() => AirQualityReading, "apidId")
  airQualityReadings: AirQualityReading[];

  @HasMany(() => AirQualitySite, "apiId")
  airQualitySites: AirQualitySite[];

  @HasMany(() => TrafficVolumeReading, "apidId")
  trafficVolumeReadings: TrafficVolumeReading[];

  @HasMany(() => TrafficVolumeStation, "apiId")
  trafficVolumeStations: TrafficVolumeStation[];
}
