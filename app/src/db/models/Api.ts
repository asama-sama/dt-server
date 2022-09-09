import {
  Table,
  Column,
  Model,
  Default,
  HasMany,
  DataType,
} from "sequelize-typescript";
import { ApiUpdateLog } from "./ApiUpdateLog";
import { AirQualityReading } from "./AirQualityReading";
import { AirQualitySite } from "./AirQualitySite";
import { TrafficVolumeReading } from "./TrafficVolumeReading";
import { TrafficVolumeStation } from "./TrafficVolumeStation";

@Table
export class Api extends Model {
  @Column
  name: string;

  @Column
  uri: string;

  @Column({
    type: DataType.STRING(1000),
  })
  queryStringParams: string;

  @Default(false)
  @Column
  historicalFetched: boolean;

  @HasMany(() => ApiUpdateLog)
  apiUpdateLogs: ApiUpdateLog[];

  @HasMany(() => AirQualityReading)
  airQualityReadings: AirQualityReading[];

  @HasMany(() => AirQualitySite)
  airQualitySites: AirQualitySite[];

  @HasMany(() => TrafficVolumeReading)
  trafficVolumeReadings: TrafficVolumeReading[];

  @HasMany(() => TrafficVolumeStation)
  trafficVolumeStations: TrafficVolumeStation[];
}
