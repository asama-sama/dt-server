import axios from "axios";
import { Frequency, PollutantType } from "../db/models/AirQualityReading";

const AIR_QUALITY_API = "https://data.airquality.nsw.gov.au/api/Data";

export type Site = {
  region: string;
  name: string;
  siteId: number;
  lat: number | null;
  lng: number | null;
};

type SiteApiObject = {
  Site_Id: number;
  SiteName: string;
  Longitude: null;
  Latitude: null;
  Region: string;
};

export const getSites = async () => {
  const res = await axios.get(`${AIR_QUALITY_API}/get_SiteDetails`);
  const sites: Site[] = res.data.map((site: SiteApiObject) => ({
    name: site.SiteName.toUpperCase(),
    region: site.Region.toUpperCase(),
    siteId: site.Site_Id,
    lat: site.Latitude,
    lng: site.Longitude,
  }));
  return sites;
};

type AirQualityDataResponse = {
  Site_Id: number;
  Parameter: {
    ParameterCode: PollutantType;
    ParameterDescription: string;
    Units: string;
    UnitsDescription: string;
    Category: string;
    SubCategory: string;
    Frequency: string;
  };
  Date: string;
  Hour: number;
  HourDescription: string;
  Value: number;
  AirQualityCategory: string | null;
  DeterminingPollutant: string | null;
};

export type AirQualityData = {
  siteId: number;
  value: number;
  date: string;
  quality: string | null;
  frequency: Frequency;
  type: PollutantType;
};

interface AirQualityDataMonthly extends AirQualityData {
  month: number;
}

export const getMonthlyObservationsAQApi = async (
  startDate: string,
  endDate: string,
  sites: number[]
) => {
  const res = await axios.post<AirQualityDataResponse[]>(
    `${AIR_QUALITY_API}/get_Observations`,
    {
      Parameters: ["NO2"],
      Categories: ["Averages"],
      SubCategories: ["Monthly"],
      Frequency: ["Hourly average"],
      StartDate: startDate,
      EndDate: endDate,
      Sites: sites,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const airQualityData: AirQualityDataMonthly[] = res.data.map((data) => ({
    siteId: data.Site_Id,
    value: data.Value,
    date: data.Date,
    month: new Date(data.Date).getMonth(),
    quality: data.AirQualityCategory,
    frequency: Frequency.MONTHLY,
    type: data.Parameter.ParameterCode,
  }));
  return airQualityData;
};

export interface AirQualityDataLive extends AirQualityData {
  hour: number;
  hourDescription: string;
}

export const getHourlyObservationsAQApi = async (
  emissions: string[],
  sites: number[],
  startDate: string,
  endDate: string
) => {
  const res = await axios.post<AirQualityDataResponse[]>(
    `${AIR_QUALITY_API}/get_Observations`,
    {
      Parameters: emissions,
      Sites: sites,
      StartDate: startDate,
      EndDate: endDate,
      Categories: ["Averages"],
      SubCategories: ["Hourly"],
      Frequency: ["Hourly average"],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const airQualityData: AirQualityDataLive[] = res.data.map((data) => ({
    date: data.Date,
    quality: data.AirQualityCategory,
    siteId: data.Site_Id,
    value: data.Value,
    hour: data.Hour,
    hourDescription: data.HourDescription,
    frequency: Frequency.HOURLY,
    type: data.Parameter.ParameterCode,
  }));
  return airQualityData;
};

export const getDailyObservations = async (
  emissions: string[],
  sites: number[],
  startDate: string,
  endDate: string
) => {
  const res = await axios.post<AirQualityDataResponse[]>(
    `${AIR_QUALITY_API}/get_Observations`,
    {
      Parameters: emissions,
      Sites: sites,
      StartDate: startDate,
      EndDate: endDate,
      Categories: ["Averages"],
      SubCategories: ["Daily"],
      Frequency: ["24h average derived from 1h average"],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const airQualityData: AirQualityData[] = res.data.map((data) => ({
    date: data.Date,
    quality: data.AirQualityCategory,
    siteId: data.Site_Id,
    value: data.Value,
    frequency: Frequency.DAILY,
    type: data.Parameter.ParameterCode,
  }));
  return airQualityData;
};
