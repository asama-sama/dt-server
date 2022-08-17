import {
  Table,
  Column,
  Model,
  HasMany,
  Unique,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { Emission } from "./Emission";
import { SuburbJson } from "../../../customTypes/suburb";

@Table
export class Suburb extends Model {
  @Unique
  @Column
  name: string;

  @Column(DataType.FLOAT)
  shapeArea: number;

  @Column(DataType.FLOAT)
  shapeLength: number;

  @AllowNull(true)
  @Column(DataType.JSON)
  geoData: SuburbJson;

  @HasMany(() => Emission)
  emissions: Emission[];
}
