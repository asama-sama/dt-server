import { Column, HasMany, Model, Table, Unique } from "sequelize-typescript";
import { TrafficIncident } from "./TrafficIncident";

@Table
export class TrafficIncidentCategory extends Model {
  @Column
  category: string;

  @Unique
  @Column
  subcategory: string;

  @HasMany(() => TrafficIncident, "trafficIncidentCategoryId")
  trafficIncidents: TrafficIncident;
}
