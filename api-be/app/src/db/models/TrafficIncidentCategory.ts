import {
  AllowNull,
  Column,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { TrafficIncident } from "./TrafficIncident";

@Table
export class TrafficIncidentCategory extends Model {
  @Column({
    set(name: string | null) {
      this.setDataValue("category", name && name.toUpperCase());
    },
  })
  category: string;

  @Unique
  @AllowNull(false)
  @Column({
    set(name: string) {
      this.setDataValue("subcategory", name.toUpperCase());
    },
  })
  subcategory: string;

  @HasMany(() => TrafficIncident, "trafficIncidentCategoryId")
  trafficIncidents: TrafficIncident;
}
