import { Table, Column, Model, HasMany } from "sequelize-typescript";
import { Emission } from "./Emission";

@Table
export class Category extends Model {
  @Column
  name: string;

  @HasMany(() => Emission)
  emissions: Emission[];
}
