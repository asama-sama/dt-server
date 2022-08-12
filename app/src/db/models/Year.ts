import { Table, Column, Model, HasMany } from "sequelize-typescript";
import { Emission } from "./Emission";

@Table
export class Year extends Model {
  @Column
  year: string;

  @HasMany(() => Emission)
  emissions: Emission[];
}
