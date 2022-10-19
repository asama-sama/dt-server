import {
  Table,
  Column,
  Model,
  Unique,
  DataType,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import { SuburbJson } from "../../customTypes/suburb";
import { TrafficIncident } from "./TrafficIncident";

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

  @HasMany(() => TrafficIncident, "suburbId")
  trafficIncidents: TrafficIncident[];
}
