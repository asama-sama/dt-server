import {
  Table,
  Column,
  Model,
  Unique,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { SuburbJson } from "../../customTypes/suburb";

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

  @AllowNull(true)
  @Column(DataType.JSON)
  geoData: SuburbJson;
}
