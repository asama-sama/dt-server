export type SuburbJson = {
  [key: string]: {
    place_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    geojson: {
      type: string;
      coordinates: number[][][];
    };
  };
};
