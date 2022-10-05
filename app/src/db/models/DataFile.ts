import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { DataSource } from "./DataSource";

@Table
export class DataFile extends Model {
  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Default(false)
  @Column
  processed: boolean;

  @ForeignKey(() => DataSource)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;
}
