export type DataSourceConsts = {
  name: string;
  uri?: string;
  method?: "post" | "get";
  queryStringParams?: string | null;
  updateFrequency?: number;
};

type DataSource = {
  [key: string]: DataSourceConsts;
};

// export const API_UPDATE_MS = 60 * 1000; // each api should be checked once an hour
// const millisecondsInHour = 1000 * 60 * 60;
const millisecondsInDay = 1000 * 60 * 60 * 24;

export const DATASOURCES: DataSource = {
  nswAirQualityReadings: {
    name: "NSW_AIR_QUALITY",
    uri: "https://data.airquality.nsw.gov.au/api/Data/get_Observations",
    method: "post",
    queryStringParams: null,
    updateFrequency: millisecondsInDay,
  },
  nswAirQualitySites: {
    name: "NSW_AIR_QUALITY_SITES",
    uri: "https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails",
    method: "get",
    queryStringParams: null,
    updateFrequency: millisecondsInDay,
  },
  nswTrafficVolumeReadings: {
    name: "NSW_TRAFFIC_VOLUME_READINGS",
    uri: "https://rms-uat.carto.com/api/v2/sql",
    method: "get",
    queryStringParams:
      "q=select d1.station_key, sum(cast(daily_total as int)), year, month from ds_aadt_permanent_hourly_data d1 where d1.station_key in (select station_key from ds_aadt_reference where ST_DWithin(ST_MakePoint(cast(wgs84_longitude as float), cast(wgs84_latitude as float)), ST_MakePoint(150.999919,-33.816228)::geography, 10000))  group by station_key, year, month",
    updateFrequency: millisecondsInDay,
  },
  nswTrafficVolumeStations: {
    name: "NSW_TRAFFIC_VOLUME_STATIONS",
    uri: "https://rms-uat.carto.com/api/v2/sql",
    method: "get",
    queryStringParams:
      "q=SELECT * FROM ds_aadt_reference WHERE publish='1' and ST_DWithin(ST_MakePoint(cast(wgs84_longitude as float), cast(wgs84_latitude as float)), ST_MakePoint(150.999919,-33.816228)::geography, 100000)",
    updateFrequency: millisecondsInDay,
  },
  nswCrimeBySuburb: {
    name: "NSW_CRIME_BY_SUBURB",
  },
};
