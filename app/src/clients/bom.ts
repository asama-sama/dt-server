import axios from "axios";
import { BomStation } from "../db/models/BomStation";
import { logger } from "../util/logger";
import { WithNull } from "../util/typeUtils";

const BOM_NSW_STATIONS_URL =
  "http://www.bom.gov.au/nsw/observations/nswall.shtml";

const BOM_STATION_WEATHER_URL = "http://www.bom.gov.au/fwo/";

export type WeatherStation = {
  name: string;
  id: string;
};

export const getStations = async () => {
  const res = await axios.get<string>(BOM_NSW_STATIONS_URL);
  const rows = res.data.matchAll(/products.*?<\/a>/g);
  const stations: WeatherStation[] = [];
  for (const row of rows) {
    const idMatch = row[0].match(/IDN.*?(?=\.shtml)/);
    const nameMatch = row[0].match(/.shtml">(.*?(?=<\/a>))/);
    const id = idMatch && idMatch[0];
    const name = nameMatch && nameMatch[1];
    if (id && name) {
      stations.push({
        name: name,
        id: id,
      });
    }
  }
  return stations;
};

export type StationWeatherAttributes = {
  sort_order: number;
  wmo: number;
  name: string;
  history_product: string;
  local_date_time: string;
  local_date_time_full: string;
  aifstime_utc: string;
  lat: number;
  lon: number;
  apparent_t: number;
  cloud: string;
  cloud_base_m: number;
  cloud_oktas: number;
  cloud_type: string;
  cloud_type_id: number;
  delta_t: number;
  gust_kmh: number;
  gust_kt: number;
  air_temp: number;
  dewpt: number;
  press: number;
  press_msl: number;
  press_qnh: number;
  press_tend: string;
  rain_trace: string;
  rel_hum: number;
  sea_state: string;
  swell_dir_worded: string;
  swell_height: null;
  swell_period: null;
  vis_km: string;
  weather: string;
  wind_dir: string;
  wind_spd_kmh: number;
  wind_spd_kt: number;
};

type GetStationWeatherResponse = {
  observations: {
    notice: object;
    header: object;
    data: Partial<WithNull<StationWeatherAttributes>>[];
  };
};

export const getStationWeather = async (station: BomStation) => {
  const stationWeatherURI = `${BOM_STATION_WEATHER_URL}${station.stationId}.json`;
  logger(`${stationWeatherURI}`);
  const res = await axios.get<GetStationWeatherResponse>(stationWeatherURI);
  return res.data.observations.data;
};
