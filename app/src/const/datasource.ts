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
        parameters: ["TEMP"],
        categories: ["Averages"],
        subcategories: ["Hourly"],
        frequency: ["Hourly average"],
      },
      {
        parameters: ["WSP"],
        categories: ["Averages"],
        subcategories: ["Hourly"],
        frequency: ["Hourly average"],
      },
      {
        parameters: ["WDR"],
        categories: ["Averages"],
        subcategories: ["Hourly"],
        frequency: ["Hourly average"],
      },
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
    params: {
      radius: 50,
      latitude: -33.86734,
      longitude: 151.20823,
      showHistory: false,
    },
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
