import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { DataType } from "sequelize-typescript";
import { Api } from "./Api";

export enum UpdateStatus {
  "SUCCESS" = "SUCCESS",
  "FAIL" = "FAIL",
}

@Table
export class ApiUpdateLog extends Model {
  @ForeignKey(() => Api)
  @Column
  apiId: number;

  @Column
  updatedAt: Date;

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

  @BelongsTo(() => Api)
  api: Api;
}
