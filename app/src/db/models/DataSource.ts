import {
  Table,
  Column,
  Model,
  Default,
  HasMany,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { DataSourceUpdateLog } from "./DataSourceUpdateLog";
import { AirQualityReading } from "./AirQualityReading";
import { AirQualitySite } from "./AirQualitySite";
import { TrafficVolumeReading } from "./TrafficVolumeReading";
import { TrafficVolumeStation } from "./TrafficVolumeStation";
import { DataFile } from "./DataFile";

@Table
export class DataSource extends Model {
  @AllowNull(false)
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

  @HasMany(() => DataSourceUpdateLog, "dataSourceId")
  dataSourceUpdateLogs: DataSourceUpdateLog[];

  @HasMany(() => AirQualityReading, "dataSourceId")
  airQualityReadings: AirQualityReading[];

  @HasMany(() => AirQualitySite, "dataSourceId")
  airQualitySites: AirQualitySite[];

  @HasMany(() => TrafficVolumeReading, "dataSourceId")
  trafficVolumeReadings: TrafficVolumeReading[];

  @HasMany(() => TrafficVolumeStation, "dataSourceId")
  trafficVolumeStations: TrafficVolumeStation[];

  @HasMany(() => DataFile, "dataSourceId")
  dataFiles: DataFile[];
}