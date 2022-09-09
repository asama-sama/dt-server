import {
  Table,
  Column,
  Model,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Api } from "./Api";

@Table
export class AirQualitySite extends Model {
  @AllowNull(false)
  @Column
  siteId: number;

  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api)
  api: Api;

  @Column
  name: string;

  @Column
  region: string;

  @Column
  lat: number;

  @Column
  lng: number;
}
