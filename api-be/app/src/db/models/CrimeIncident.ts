import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Table,
  Model,
} from "sequelize-typescript";
import { CrimeCategory } from "./CrimeCategory";
import { DataFile } from "./DataFile";
import { Suburb } from "./Suburb";

@Table
export class CrimeIncident extends Model {
  @ForeignKey(() => CrimeCategory)
  @AllowNull(false)
  @Column
  crimeCategoryId: number;

  @BelongsTo(() => CrimeCategory, "crimeCategoryId")
  crimeCategory: CrimeCategory;

  @ForeignKey(() => Suburb)
  @AllowNull(false)
  @Column
  suburbId: number;

  @BelongsTo(() => Suburb, "suburbId")
  suburb: Suburb;

  @ForeignKey(() => DataFile)
  @AllowNull(false)
  @Column
  dataFileId: number;

  @BelongsTo(() => DataFile, "dataFileId")
  dataFile: DataFile;

  @AllowNull(false)
  @Column
  year: number;

  @AllowNull(false)
  @Column
  month: number;

  @AllowNull(false)
  @Column
  value: number;
}
