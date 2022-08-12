import {
  Table,
  Column,
  Model,
  HasMany,
  Unique,
  DataType,
} from "sequelize-typescript";
import { Emission } from "./Emission";

@Table
export class Suburb extends Model {
  @Unique
  @Column
  name: string;

  @Column(DataType.FLOAT)
  shapeArea: number;

  @Column(DataType.FLOAT)
  shapeLength: number;

  @HasMany(() => Emission)
  emissions: Emission[];
}
