import {
  Table,
  Column,
  Model,
  Default,
  HasMany,
  DataType,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import { DataSourceUpdateLog } from "./DataSourceUpdateLog";
import { AirQualityReading } from "./AirQualityReading";
import { AirQualitySite } from "./AirQualitySite";
import { TrafficVolumeReading } from "./TrafficVolumeReading";
import { TrafficVolumeStation } from "./TrafficVolumeStation";
import { DataFile } from "./DataFile";
import { TrafficIncident } from "./TrafficIncident";

@Table
export class DataSource extends Model {
  @Unique
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

  @HasMany(() => TrafficIncident, "dataSourceId")
  trafficIncidents: TrafficIncident[];

  @HasMany(() => DataFile, "dataSourceId")
  dataFiles: DataFile[];

  @HasMany(() => DataSourceUpdateLog, "dataSourceId")
  dataSourceUpdateLog: DataSourceUpdateLog[];
}
