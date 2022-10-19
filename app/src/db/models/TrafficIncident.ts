import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { DataSource } from "./DataSource";
import { Suburb } from "./Suburb";
import { TrafficIncidentCategory } from "./TrafficIncidentCategory";

@Table
export class TrafficIncident extends Model {
  @PrimaryKey
  @Column({
    primaryKey: true,
    type: DataType.STRING,
    allowNull: false,
  })
  id: string;
  //
  @AllowNull(false)
  @Column
  lat: number;

  @AllowNull(false)
  @Column
  lng: number;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;

  @AllowNull(false)
  @ForeignKey(() => TrafficIncidentCategory)
  @Column
  trafficIncidentCategoryId: number;

  @BelongsTo(() => TrafficIncidentCategory, "trafficIncidentCategoryId")
  trafficIncidentCategory: TrafficIncidentCategory;

  @AllowNull(false)
  @ForeignKey(() => DataSource)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;
}
