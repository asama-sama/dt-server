import {
  Table,
  Column,
  Model,
  HasMany,
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
import { BomReading } from "./BomReading";

@Table
export class DataSource extends Model {
  @Unique
  @AllowNull(false)
  @Column
  name: string;

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

  @HasMany(() => BomReading, "dataSourceId")
  bomReadings: BomReading[];
}
