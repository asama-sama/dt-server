import { AllowNull, Column, Model, Table } from "sequelize-typescript";

@Table
export class BomStation extends Model {
  @AllowNull(false)
  @Column
  stationId: string;

  @AllowNull(false)
  @Column
  name: string;
}
