import { AllowNull, Column, HasMany, Model, Table } from "sequelize-typescript";
import { CrimeIncident } from "./CrimeIncident";

@Table
export class CrimeCategory extends Model {
  // TODO: Remove this column
  @Column
  Category: string;

  // TODO: remove this column
  @Column
  Subcategory: string;

  //  TODO: fill with data and add @AllowNull(false)
  @Column
  category: string;

  @Column
  subcategory: string;

  @HasMany(() => CrimeIncident, "crimeCategoryId")
  crimeIncidents: CrimeIncident[];
}
