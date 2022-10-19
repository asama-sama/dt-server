import axios from "axios";
import { DATASOURCES } from "../const/datasource";

type FetchIncidentsFunction = (
  endDate: Date,
  initialise?: boolean
) => Promise<void>;

export const fetchIncidents: FetchIncidentsFunction = async (
  endDate,
  initialise = false
) => {
  const { NSW_OPEN_DATA_API_KEY } = process.env;
  if (!NSW_OPEN_DATA_API_KEY)
    throw new Error("NSW_OPEN_DATA_API_KEY must be defined");

  const { uri, params } = DATASOURCES.trafficIncidents;
  if (!uri) throw new Error("uri for fetch traffic incidents must be defined");

  const startdate = new Date(endDate);

  if (initialise) {
    startdate.setDate(startdate.getDate() - 7);
  } else {
    startdate.setDate(startdate.getDate() - 2);
  }

  const res = await axios.post(
    uri,
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
