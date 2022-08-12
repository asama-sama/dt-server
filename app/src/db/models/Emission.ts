import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { Year } from "./Year";
import { Category } from "./Category";

@Table
export class Emission extends Model {
  @Column
  reading: number;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @ForeignKey(() => Year)
  @Column
  yearId: number;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @BelongsTo(() => Suburb)
  suburb: Suburb;

  @BelongsTo(() => Year)
  year: Year;

  @BelongsTo(() => Category)
  category: Category;
}
