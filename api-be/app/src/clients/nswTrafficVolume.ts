import axios from "axios";
import { dateToString } from "../util/date";

const BASE_URL = `https://rms-uat.carto.com/api/v2/sql`;
const RANGE_IN_METERS = 200000;
const MAP_CENTER = [-33.861901, 151.211863];

type NswApiGetStationCountsByMonth = {
  rows: {
    station_key: string;
    daily_total: number;
    date: string;
  }[];
};
const getDailyStationCountQuery = (
  fromDate: string, // format yyyy-mm-dd
  toDate: string // format yyyy-mm-dd
) => {
  return `SELECT station_key,date,daily_total 
  FROM  ds_aadt_permanent_hourly_data
  WHERE date > '${fromDate}' and date < '${toDate}'
  order by date asc
  `;
};

export type DailyStationCount = {
  date: Date;
  stationKey: string;
  count: number;
};

type GetDailyStationCountsSignature = (
  fromDate: Date,
  toDate: Date
) => Promise<DailyStationCount[]>;

export const getDailyStationCounts: GetDailyStationCountsSignature = async (
  fromDate,
  toDate
) => {
  const query = getDailyStationCountQuery(
    dateToString(fromDate),
    dateToString(toDate)
  );
  const { data } = await axios.get<NswApiGetStationCountsByMonth>(
    `${BASE_URL}?q=${query}`
  );
  const res: DailyStationCount[] = data.rows.map(
    ({ station_key, date, daily_total }) => ({
      stationKey: station_key,
      count: daily_total,
      date: new Date(date),
    })
  );
  return res;
};

const GET_STATIONS = `SELECT station_key, station_id, name, road_name, road_name_base, common_road_name, road_on_type, lane_count,road_classification_type,   road_classification_admin, rms_region, lga, suburb, post_code,wgs84_latitude, wgs84_longitude, secondary_name, full_name FROM ds_aadt_reference WHERE publish='1' and ST_DWithin(ST_MakePoint(cast(wgs84_longitude as float), cast(wgs84_latitude as float)), ST_MakePoint(${MAP_CENTER[1]},${MAP_CENTER[0]})::geography, ${RANGE_IN_METERS})`;

type StationApiResponse = {
  station_key: string;
  station_id: string;
  name: string;
  rms_region: string;
  lga: string;
  suburb: string;
  post_code: string;
  wgs84_latitude: string;
  wgs84_longitude: string;
};

export interface Station
  extends Omit<StationApiResponse, "wgs84_latitude" | "wgs84_longitude"> {
  longitude: number;
  latitude: number;
}

type NswApiGetStations = {
  rows: StationApiResponse[];
};

export const getStations = async (): Promise<Station[]> => {
  const { data } = await axios.get<NswApiGetStations>(
    `${BASE_URL}?q=${GET_STATIONS}`
  );

  const stations = data.rows.map((station) => ({
    ...station,
    longitude: parseFloat(station.wgs84_longitude),
    latitude: parseFloat(station.wgs84_latitude),
  }));
  return stations;
};
