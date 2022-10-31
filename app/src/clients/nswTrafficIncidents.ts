import axios from "axios";
import { DATASOURCES } from "../const/datasource";

type RoadInfo = {
  region: string;
  suburb: string;
};

type IncidentResponse = {
  Hazards: {
    id: string;
    features: {
      type: string;
      id: number;
      geometry: {
        type: string;
        coordinates: number[];
      };
      properties: {
        created: number;
        ended?: boolean;
        end?: number;
        mainCategory: string;
        lastUpdated: number;
        roads: RoadInfo[];
      };
    };
  };
};

export type FetchIncidentsApiResponse = {
  count: number;
  result: IncidentResponse[];
};

type FetchIncidentsFunction = (
  endDate: Date,
  initialise?: boolean
) => Promise<FetchIncidentsApiResponse>;

const URI = "https://api.transport.nsw.gov.au/v1/traffic/historicaldata";

export const fetchIncidents: FetchIncidentsFunction = async (
  endDate,
  initialise = false
) => {
  const { NSW_OPEN_DATA_API_KEY } = process.env;
  if (!NSW_OPEN_DATA_API_KEY)
    throw new Error("NSW_OPEN_DATA_API_KEY must be defined");

  const { params } = DATASOURCES.trafficIncidents;

  const startdate = new Date(endDate);

  if (initialise) {
    startdate.setMonth(startdate.getMonth() - 2);
  } else {
    startdate.setDate(startdate.getDate() - 2);
  }

  const res = await axios.post<FetchIncidentsApiResponse>(
    URI,
    {
      ...params,
      created: startdate,
      end: endDate,
    },
    {
      headers: {
        authorization: `apikey ${NSW_OPEN_DATA_API_KEY}`,
      },
    }
  );

  return res.data;
};
