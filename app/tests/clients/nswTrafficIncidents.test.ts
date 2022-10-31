/// <reference types="@types/jest" />;
import axios from "axios";
import { fetchIncidents } from "../../src/clients/nswTrafficIncidents";
import { DATASOURCES } from "../../src/const/datasource";

describe("nswTrafficIncidents", () => {
  beforeEach(() => {
    process.env.NSW_OPEN_DATA_API_KEY = "testkey";
  });
  test("it should throw an error if NSW_OPEN_DATA_API_KEY is not defined", async () => {
    process.env.NSW_OPEN_DATA_API_KEY = "";
    const endDate = new Date();
    expect(() => fetchIncidents(endDate)).rejects.toThrow(
      new Error("NSW_OPEN_DATA_API_KEY must be defined")
    );
  });

  test("it should call the post method on axios", async () => {
    const endDate = new Date();
    await fetchIncidents(endDate);
    expect(axios.post).toHaveBeenCalled();
  });

  test("it should call axios with the correct parameters", async () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 2);
    await fetchIncidents(endDate);
    expect(axios.post).toHaveBeenCalledWith(
      DATASOURCES.trafficIncidents.uri,
      {
        ...DATASOURCES.trafficIncidents.params,
        created: startDate,
        end: endDate,
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
    await fetchIncidents(endDate, true);
    expect(axios.post).toHaveBeenCalledWith(
      DATASOURCES.trafficIncidents.uri,
      {
        ...DATASOURCES.trafficIncidents.params,
        created: startDate,
        end: endDate,
      },
      {
        headers: {
          authorization: "apikey testkey",
        },
      }
    );
  });
});
