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
import { SuburbJson } from "../../customTypes/suburb";
import { ApiSuburb } from "./ApiSuburb";

@Table
export class Suburb extends Model {
  @Unique
  @Column({
    type: DataType.STRING,
    set(name: string) {
      this.setDataValue("name", name.toUpperCase());
    },
  })
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

  @HasMany(() => ApiSuburb)
  apiSuburbs: ApiSuburb[];
}
