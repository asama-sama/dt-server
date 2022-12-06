/// <reference types="@types/jest" />;
import axios from "axios";
import { fetchIncidents } from "../../src/clients/nswTrafficIncidents";
import { TRAFFIC_SEARCH_LOCATIONS } from "../../src/const/trafficIncidents";

describe("nswTrafficIncidents", () => {
  beforeEach(() => {
    process.env.NSW_OPEN_DATA_API_KEY = "testkey";
  });
  test("it should throw an error if NSW_OPEN_DATA_API_KEY is not defined", async () => {
    process.env.NSW_OPEN_DATA_API_KEY = "";
    const endDate = new Date();
    expect(() => fetchIncidents(new Date(), endDate)).rejects.toThrow(
      new Error("NSW_OPEN_DATA_API_KEY must be defined")
    );
  });

  test("it should call the post method on axios", async () => {
    const endDate = new Date();
    await fetchIncidents(new Date(), endDate);
    expect(axios.post).toHaveBeenCalled();
  });

  test("it should call axios with the correct parameters", async () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 2);
    await fetchIncidents(startDate, endDate);
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.transport.nsw.gov.au/v1/traffic/historicaldata",
      {
        ...TRAFFIC_SEARCH_LOCATIONS,
        created: startDate,
        end: endDate,
        showHistory: false,
      },
      {
        headers: {
          authorization: "apikey testkey",
        },
      }
    );
  });

  test("it should call axios with the correct parameters if init=true", async () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 2);
    await fetchIncidents(startDate, endDate);
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.transport.nsw.gov.au/v1/traffic/historicaldata",
      {
        ...TRAFFIC_SEARCH_LOCATIONS,
        created: startDate,
        end: endDate,
        showHistory: false,
      },
      {
        headers: {
          authorization: "apikey testkey",
        },
      }
    );
  });
});
