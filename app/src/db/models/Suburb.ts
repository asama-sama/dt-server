import {
  Table,
  Column,
  Model,
  Unique,
  DataType,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import { SuburbJson } from "../../customTypes/suburb";
import { AirQualitySite } from "./AirQualitySite";
import { BomStation } from "./BomStation";
import { TrafficIncident } from "./TrafficIncident";
import { TrafficVolumeStation } from "./TrafficVolumeStation";

@Table
export class Suburb extends Model {
  @Unique
  @Column({
    type: DataType.STRING,
    set(name: string) {
      this.setDataValue("name", name.toUpperCase());
    },
  })
  name: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  geoData: SuburbJson;

  @HasMany(() => TrafficIncident, "suburbId")
  trafficIncidents: TrafficIncident[];

  @HasMany(() => AirQualitySite, "suburbId")
  airQualitySites: AirQualitySite[];

  @HasMany(() => TrafficVolumeStation, "suburbId")
  trafficVolumeStations: TrafficVolumeStation[];

  @HasMany(() => BomStation, "suburbId")
  bomStations: BomStation[];
}
