import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { DataSource } from "./DataSource";

export enum UpdateStatus {
  "SUCCESS" = "SUCCESS",
  "FAIL" = "FAIL",
}

@Table
export class DataSourceUpdateLog extends Model {
  @ForeignKey(() => DataSource)
  @Column
  dataSourceId: number;

  @BelongsTo(() => DataSource, "dataSourceId")
  dataSource: DataSource;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: {
      matchesEnum(value: string) {
        if (!(value in UpdateStatus)) {
          throw new Error(`status must be of type UpdateStatus: ${value}`);
        }
      },
    },
  })
  status: string;

  @Column({
    type: DataType.TEXT,
  })
  message: string;
}
