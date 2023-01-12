import { Point, Polygon } from "./geometry";

export type DatewiseCategorySums = {
  [date: string]: {
    // date is yyyy-mm-dd
    [type: string]: number; // type is pollutant type, number is the reading
  };
};

export type GeoData = {
  id: number; // database id of the entity
  geometry: Point | Polygon;
};
