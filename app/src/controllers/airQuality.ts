import axios from "axios";

const AIR_QUALITY_API =
  "https://data.airquality.nsw.gov.au/api/Data/get_Observations";

type AirQualityDataResponse = {
  Site_Id: number;
  Parameter: {
    ParameterCode: string;
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

type AirQualityData = {
  siteId: number;
  value: number;
  date: string;
  month: number;
};

export const getObservations = async (sites: number[]) => {
  const date = new Date();
  const startDate = `${date.getFullYear()}-01-01`;
  const endDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
  const res = await axios.post<AirQualityDataResponse[]>(
    AIR_QUALITY_API,
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
  const airQualityData: AirQualityData[] = res.data.map((data) => ({
    siteId: data.Site_Id,
    value: data.Value,
    date: data.Date,
    month: new Date(data.Date).getMonth(),
  }));
  return airQualityData;
};
