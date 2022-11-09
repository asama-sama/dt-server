import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { TrafficIncident } from "./TrafficIncident";

@Table
export class TrafficIncidentSuburb extends Model {
  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @ForeignKey(() => TrafficIncident)
  @Column
  trafficIncidentId: number;
}
