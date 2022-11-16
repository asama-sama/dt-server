import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { CosGhgEmission } from "./CosGhgEmission";
import { Suburb } from "./Suburb";

@Table
export class CosGhgEmissionSuburb extends Model {
  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;

  @ForeignKey(() => CosGhgEmission)
  @Column
  cosGhgEmissionId: number;

  @BelongsTo(() => CosGhgEmission, "cosGhgEmissionId")
  cosGhgEmission: CosGhgEmission;
}
