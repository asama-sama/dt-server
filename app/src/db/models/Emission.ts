import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { Category } from "./Category";

@Table
export class Emission extends Model {
  @Column(DataType.FLOAT)
  reading: number;

  @Column
  year: number;

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

export interface EmissionsAggregate extends Emission {
  suburbId: number;
  suburbAggregateEmission: number;
}
