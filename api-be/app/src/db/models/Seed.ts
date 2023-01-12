import { Table, Model, Column, AllowNull, Default } from "sequelize-typescript";

@Table
export class Seed extends Model {
  @AllowNull(false)
  @Column
  name: string;

  @Default(false)
  @Column
  processed: boolean;

  @Column
  message: string;
}
