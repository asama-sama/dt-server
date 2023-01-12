import axios from "axios";
import { TRAFFIC_SEARCH_LOCATIONS } from "../const/trafficIncidents";

type RoadInfo = {
  region: string;
  suburb: string;
};

export type IncidentResponse = {
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
  startDate: Date,
  endDate: Date
) => Promise<IncidentResponse[]>;

const URI = "https://api.transport.nsw.gov.au/v1/traffic/historicaldata";

export const fetchIncidents: FetchIncidentsFunction = async (
  startDate,
  endDate
) => {
  const { NSW_OPEN_DATA_API_KEY } = process.env;
  if (!NSW_OPEN_DATA_API_KEY)
    throw new Error("NSW_OPEN_DATA_API_KEY must be defined");

  const res = await axios.post<FetchIncidentsApiResponse>(
    URI,
    {
      ...TRAFFIC_SEARCH_LOCATIONS,
      created: startDate,
      end: endDate,
      showHistory: false,
    },
    {
      headers: {
        authorization: `apikey ${NSW_OPEN_DATA_API_KEY}`,
      },
    }
  );

  return res.data.result;
};
