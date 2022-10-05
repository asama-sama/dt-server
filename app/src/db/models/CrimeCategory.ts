import { Column, Model, Table } from "sequelize-typescript";

@Table
export class CrimeCategory extends Model {
  @Column
  Category: string;

  @Column
  Subcategory: string;
}
