import {
  AllowNull,
  Column,
  HasMany,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { CosGhgEmission } from "./CosGhgEmission";

@Table
export class CosGhgCategory extends Model {
  @Unique
  @AllowNull(false)
  @Column
  name: string;

  @HasMany(() => CosGhgEmission, "categoryId")
  emissions: CosGhgEmission[];
}
