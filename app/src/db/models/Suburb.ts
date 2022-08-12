import { Table, Column, Model, HasMany } from "sequelize-typescript";
import { Emission } from "./Emission";

@Table
export class Suburb extends Model {
  @Column
  name: string;

  @Column
  shapeArea: number;

  @Column
  shapeLength: number;

  @HasMany(() => Emission)
  emissions: Emission[];
}
