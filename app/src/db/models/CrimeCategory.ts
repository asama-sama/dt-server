import { AllowNull, Column, HasMany, Model, Table } from "sequelize-typescript";
import { CrimeIncident } from "./CrimeIncident";

@Table
export class CrimeCategory extends Model {
  @AllowNull(false)
  @Column
  Category: string;

  @Column
  Subcategory: string;

  @HasMany(() => CrimeIncident, "crimeCategoryId")
  crimeIncidents: CrimeIncident[];
}
