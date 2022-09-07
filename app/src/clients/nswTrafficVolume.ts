import axios from "axios";

const BASE_URL = `https://rms-uat.carto.com/api/v2/sql`;

type NswApiGetStationCountsByMonth = {
  rows: {
    station_key: string;
    count: number;
    month: string;
  }[];
};
const GET_STATION_COUNTS_BY_MONTH = (year: number) =>
  `SELECT station_key, sum(cast(daily_total as int)) as count, month FROM  ds_aadt_permanent_hourly_data WHERE year='${year}' group by station_key, month`;

interface GetStationCountsByMonth {
  month: number;
  stationKey: string;
  count: number;
}
export const getStationCountsByMonth = async (year: number) => {
  const { data } = await axios.get<NswApiGetStationCountsByMonth>(
    `${BASE_URL}?q=${GET_STATION_COUNTS_BY_MONTH(year)}`
  );
  const res: GetStationCountsByMonth[] = data.rows.map((d) => ({
    stationKey: d.station_key,
    count: d.count,
    month: parseInt(d.month) - 1,
  }));

  return res;
};

const GET_STATIONS = `SELECT station_key, station_id, name, road_name, road_name_base, common_road_name, road_on_type, lane_count,road_classification_type,   road_classification_admin, rms_region, lga, suburb, post_code,wgs84_latitude, wgs84_longitude, secondary_name, full_name FROM ds_aadt_reference WHERE publish='1'`;

type Station = {
  station_key: string;
  station_id: string;
  name: string;
  road_name: string;
  road_name_base: string;
  common_road_name: string;
  road_on_type: string;
  lane_count: string;
  road_classification_type: string;
  road_classification_admin: string;
  rms_region: string;
  lga: string;
  suburb: string;
  post_code: string;
  wgs84_latitude: string;
  wgs84_longitude: string;
  secondary_name: string;
  full_name: string;
};

type NswApiGetStations = {
  rows: Station[];
};

export const getStations = async () => {
  const { data } = await axios.get<NswApiGetStations>(
    `${BASE_URL}?q=${GET_STATIONS}`
  );
  const stationMap: { [key: string]: Station } = {};
  data.rows.forEach((d) => {
    stationMap[d.station_key] = d;
  });
  return stationMap;
};
