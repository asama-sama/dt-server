import { Column, HasMany, Model, Table, Unique } from "sequelize-typescript";
import { TrafficIncident } from "./TrafficIncident";

@Table
export class TrafficIncidentCategory extends Model {
  @Unique
  @Column
  name: string;

  @HasMany(() => TrafficIncident, "trafficIncidentCategoryId")
  trafficIncidents: TrafficIncident;
}
