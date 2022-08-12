import { Table, Column, Model, HasMany, Unique } from "sequelize-typescript";
import { Emission } from "./Emission";

@Table
export class Category extends Model {
  @Unique
  @Column
  name: string;

  @HasMany(() => Emission)
  emissions: Emission[];
}
