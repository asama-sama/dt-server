import { AllowNull, Column, Model, Table } from "sequelize-typescript";

@Table
export class CrimeCategory extends Model {
  @AllowNull(false)
  @Column
  Category: string;

  @Column
  Subcategory: string;
}
