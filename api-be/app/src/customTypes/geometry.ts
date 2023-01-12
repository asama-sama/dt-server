export type Polygon = {
  crs: { type: string; properties: { name: string } };
  type: "Polygon";
  coordinates: number[][][];
};

export type Point = {
  crs: { type: string; properties: { name: string } };
  type: "Point";
  coordinates: number[];
};

export type LatLng = {
  lat: number;
  lng: number;
};
