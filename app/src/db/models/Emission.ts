import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { Category } from "./Category";

@Table
export class Emission extends Model {
  @Column
  reading: number;

  @Column
  year: Date;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @BelongsTo(() => Suburb)
  suburb: Suburb;

  @BelongsTo(() => Category)
  category: Category;
}
