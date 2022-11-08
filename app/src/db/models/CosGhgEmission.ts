import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Suburb } from "./Suburb";
import { CosGhgCategory } from "./CosGhgCategory";
import { DataFile } from "./DataFile";
import { CosGhgEmissionSuburb } from "./CosGhgEmissionSuburb";

@Table
export class CosGhgEmission extends Model {
  @Column(DataType.FLOAT)
  reading: number;

  @Column
  year: number;

  @ForeignKey(() => DataFile)
  @AllowNull(false)
  @Column
  dataFileId: number;

  @BelongsTo(() => DataFile, "dataFileId")
  dataFile: DataFile;

  @ForeignKey(() => Suburb)
  @Column
  suburbId: number;

  @BelongsToMany(() => Suburb, () => CosGhgEmissionSuburb)
  suburbs: Suburb[];

  @ForeignKey(() => CosGhgCategory)
  @Column
  categoryId: number;

  @BelongsTo(() => CosGhgCategory, "categoryId")
  category: CosGhgCategory;
}
