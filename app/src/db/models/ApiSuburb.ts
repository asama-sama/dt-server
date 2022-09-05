import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { Api } from "./Api";

@Table
export class ApiSuburb extends Model {
  @AllowNull(true)
  @Column(DataType.JSON)
  apiSuburbMeta: Record<string, unknown>;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @ForeignKey(() => Api)
  @Column
  apiId: number;

  @BelongsTo(() => Suburb)
  suburb: Suburb;

  @BelongsTo(() => Api)
  api: Api;
}
