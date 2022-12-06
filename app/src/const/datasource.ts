import { JobParams } from "../initialise/jobs";

export type AirQualityApiFrequencies =
  | "24h average derived from 1h average"
  | "Hourly average";

export type AirQualityUpdateParams = {
  parameters: string[];
  categories: string[];
  subcategories: string[];
  frequency: AirQualityApiFrequencies[];
};

type DataSource = {
  [key: string]: JobParams;
};

// export const API_UPDATE_MS = 60 * 1000; // each api should be checked once an hour
const millisecondsInHour = 1000 * 60 * 60;
const millisecondsInDay = 1000 * 60 * 60 * 24;

export const DATASOURCES: DataSource = {
  nswAirQualityReadings: {
    name: "NSW_AIR_QUALITY",
    updateFrequency: millisecondsInDay,
    params: [
      {
        parameters: ["NO2"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      {
        parameters: ["NO"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      {
        parameters: ["NEPH"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      {
        parameters: ["CO"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      {
        parameters: ["SO2"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      //  these never seem to work
      // {
      //   parameters: ["PM10"],
      //   categories: ["Averages"],
      //   subcategories: ["Daily"],
      //   frequency: ["24h average derived from 1h average"],
      // },
      // {
      //   parameters: ["PM2.5"],
      //   categories: ["Averages"],
      //   subcategories: ["Daily"],
      //   frequency: ["24h average derived from 1h average"],
      // },
      {
        parameters: ["OZONE"],
        categories: ["Averages"],
        subcategories: ["Daily"],
        frequency: ["24h average derived from 1h average"],
      },
      // too much data for initial fetch
      // {
      //   parameters: ["SOLAR"],
      //   categories: ["Averages"],
      //   subcategories: ["Hourly"],
      //   frequency: ["Hourly average"],
      // },
    ],
  },
  nswAirQualitySites: {
    name: "NSW_AIR_QUALITY_SITES",
    updateFrequency: millisecondsInDay,
  },
  nswTrafficVolumeReadings: {
    name: "NSW_TRAFFIC_VOLUME_READINGS",
    updateFrequency: millisecondsInDay,
  },
  nswTrafficVolumeStations: {
    name: "NSW_TRAFFIC_VOLUME_STATIONS",
    updateFrequency: millisecondsInDay,
  },
  nswCrimeBySuburb: {
    name: "NSW_CRIME_BY_SUBURB",
    updateFrequency: 0,
  },
  cosGhgEmissions: {
    name: "COS_GHG_EMISSIONS",
    updateFrequency: 0,
  },
  trafficIncidents: {
    name: "NSW_TRAFFIC_INCIDENTS",
    updateFrequency: millisecondsInDay,
  },
  bomSites: {
    name: "BOM_SITES",
    updateFrequency: millisecondsInDay,
  },
  bomReadings: {
    name: "BOM_READINGS",
    updateFrequency: millisecondsInHour,
  },
};
