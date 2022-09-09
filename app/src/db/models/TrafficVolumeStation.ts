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
export class TrafficVolumeStation extends Model {
  @ForeignKey(() => Api)
  @AllowNull(false)
  @Column
  apiId: number;

  @BelongsTo(() => Api)
  api: Api;

  @AllowNull(false)
  @Column
  stationKey: number;

  @AllowNull(false)
  @Column
  stationId: number;

  @AllowNull(false)
  @Column
  lat: number;

  @AllowNull(false)
  @Column
  lng: number;

  @Column
  name: string;

  @Column
  suburb: string;

  @Column
  lga: string;

  @Column
  rmsRegion: string;

  @Column
  postCode: string;
}
