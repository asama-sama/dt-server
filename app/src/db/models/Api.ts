import { Table, Column, Model, HasMany, Unique } from "sequelize-typescript";
import { ApiSuburb } from "./ApiSuburb";

@Table
export class Api extends Model {
  @Unique
  @Column
  name: string;

  @HasMany(() => ApiSuburb)
  emissions: ApiSuburb[];
}
