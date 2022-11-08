import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { CosGhgEmission } from "./CosGhgEmission";
import { Suburb } from "./Suburb";

@Table
export class CosGhgEmissionSuburb extends Model {
  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @ForeignKey(() => CosGhgEmission)
  @Column
  cosGhgEmissionId: number;
}
