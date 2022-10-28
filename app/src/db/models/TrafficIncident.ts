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
    allowNull: false,
    autoIncrement: false,
    type: DataType.INTEGER,
  })
  id: number;

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

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  created: Date;

  @Column({
    type: DataType.DATE,
  })
  end: Date;

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
