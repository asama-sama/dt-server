import axios from "axios";
import { logger } from "../util/logger";
import { Loader } from "../util/loader";

// handles queries to nominatim to abide by terms of use

type SuburbSearchParameters = {
  name: string;
  state: string;
  viewbox: {
    lon1: number; // long 1
    lat1: number; // lat 1
    lon2: number; // long 2
    lat2: number; // lat 2
  };
};

type CallbackFn = (
  result: NominatimResponse,
  suburbName: string
) => Promise<void>;

type CallbackFailFn = (suburbName: string) => Promise<void>;

type NominatimResponse = {
  place_id: number;
  osm_type: "node" | "way" | "relation";
  osm_id: 6074667;
  boundingbox: [number, number, number, number];
  lat: number;
  lon: number;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon: string;
  address: {
    town: string;
    municipality: string;
    state: string;
    "ISO3166-2-lvl4": string;
    postcode: string;
    country: string;
    country_code: string;
  };
  geojson: {
    type: string;
    coordinates: number[];
  };
};

export const bulkSearch = async (
  suburbSearchParameters: SuburbSearchParameters[],
  callback: CallbackFn,
  callbackFail: CallbackFailFn
) => {
  logger("start bulkSearch");
  const { FETCH_SUBURBS, NOMINATIM_API_TIMEOUT } = process.env;

  const nominatimApiTimeout = parseInt(NOMINATIM_API_TIMEOUT || "");
  const apiTimeout = !isNaN(nominatimApiTimeout) ? nominatimApiTimeout : 1500;
  if (FETCH_SUBURBS !== "yes") {
    return [];
  }
  const loader = new Loader(suburbSearchParameters.length);
  for (const {
    name,
    state,
    viewbox: { lon1, lat1, lon2, lat2 },
  } of suburbSearchParameters) {
    loader.tick();
    logger(`fetch ${name},${state} from nomatim`);
    const res = await axios.get<NominatimResponse[]>(
      `https://nominatim.openstreetmap.org/search?q=${name},${state}&format=json&polygon_geojson=1&addressdetails=1&countrycodes=au&viewbox=${lon1},${lat1},${lon2},${lat2}`
    );
    for (let i = 0; i < res.data.length; i++) {
      const result = res.data[i];
      if (result?.geojson?.type === "Polygon") {
        await callback(result, name);
        break;
      }
    }
    await callbackFail(name);
    await new Promise((r) => setTimeout(r, apiTimeout)); // wait 1.5 seconds to not make nominatim angry
  }
  logger("nomatim fetch complete");
};
