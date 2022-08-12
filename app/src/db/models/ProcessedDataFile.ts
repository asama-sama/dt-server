import { Table, Column, Model, Unique } from "sequelize-typescript";

@Table
export class ProcessedDataFile extends Model {
  @Unique
  @Column
  name: string;
}
