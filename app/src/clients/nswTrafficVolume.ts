import axios from "axios";
import { getValidMonthsYears } from "../util/getValidMonthsYears";
import { listToSqlStringList } from "../util/sql";

const BASE_URL = `https://rms-uat.carto.com/api/v2/sql`;
const RANGE_IN_METERS = 200000;
const MAP_CENTER = [-33.861901, 151.211863];
const MONTHS_TO_SEARCH = 6;

type NswApiGetStationCountsByMonth = {
  rows: {
    station_key: string;
    count: number;
    month: number;
    year: number;
  }[];
};
const getStationCountsByMonthQuery = (
  yearsToSearch: string,
  monthsToSearch: string
) => {
  return `SELECT 
    station_key, 
    sum(cast(daily_total as int)) as count, 
    cast(year as int),
    cast(month as int)
  FROM  ds_aadt_permanent_hourly_data
  WHERE
    year in ${yearsToSearch} 
    and month in ${monthsToSearch}
  group by station_key, year, month
  order by year desc, month desc
  `;
};

export interface MonthlyStationCount {
  year: number;
  month: number;
  stationKey: string;
  count: number;
}
export const getStationCountsByMonth = async (stationIds: string[]) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const { monthsToSearch, yearsToSearch } = getValidMonthsYears(
    currentYear,
    currentMonth,
    MONTHS_TO_SEARCH
  );

  const yearsStrList = listToSqlStringList(yearsToSearch);
  const monthsStrList = listToSqlStringList(monthsToSearch);

  const { data } = await axios.get<NswApiGetStationCountsByMonth>(
    `${BASE_URL}?q=${getStationCountsByMonthQuery(yearsStrList, monthsStrList)}`
  );

  // we are filtering after the api response rather than in the request itself
  // because for some reason when combining year and "filter by range" in the
  // "where" clause, the request hangs
  const stationsToInclude: { [key: string]: boolean } = {};
  stationIds.map((stationId) => (stationsToInclude[stationId] = true));
  const res: MonthlyStationCount[] = data.rows
    .filter((stationCount) => stationsToInclude[stationCount.station_key])
    .map((d) => ({
      stationKey: d.station_key,
      count: d.count,
      month: d.month - 1,
      year: d.year,
    }));

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
