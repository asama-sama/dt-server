/// <reference types="@types/jest" />;
import request from "supertest";
import { app } from "../../src/app";
import { getTrafficIncidentsForSuburbs } from "../../src/controllers/nswTrafficIncidents";

jest.mock("../../src/controllers/nswTrafficIncidents", () => {
  return {
    __esModule: true,
    getTrafficIncidentsForSuburbs: jest.fn(),
  };
});

const getTrafficIncidentsForSuburbsMock =
  getTrafficIncidentsForSuburbs as jest.MockedFunction<
    typeof getTrafficIncidentsForSuburbs
  >;

describe("trafficIncidents api", () => {
  describe("get", () => {
    test("it should call getTrafficIncidentsForSuburbs with the correct parameters", async () => {
      const res = await request(app).get(
        "/trafficincidents?suburbIds[]=1&suburbIds[]=2&startDate=2022-08-05"
      );
      expect(res.status).toBe(200);
      expect(getTrafficIncidentsForSuburbsMock).toHaveBeenCalledWith(
        [1, 2],
        new Date("2022-08-05"),
        undefined
      );
    });

    test("it should throw an error if suburbIds not an array", async () => {
      const res = await request(app).get("/trafficincidents?suburbIds=test");
      expect(res.status).toBe(400);
      expect(res.text).toBe("must be an array");
    });

    test("it should throw an error if suburbIds are not numbers", async () => {
      const res = await request(app).get(
        "/trafficincidents?suburbIds[]=1&suburbIds[]=a"
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("must be a number");
    });

    test("it should throw an error if startDate is invalid", async () => {
      const startDate = "invalid";
      let res = await request(app).get(
        `/trafficincidents?suburbIds[]=1&startDate=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");

      res = await request(app).get(
        `/trafficincidents?suburbIds[]=1&startDate[]=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be a string");
    });

    test("it should throw an error if endDate is invalid", async () => {
      let res = await request(app).get(
        `/trafficincidents?suburbIds[]=1&startDate=2022-08-01&endDate=invalid`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");

      res = await request(app).get(
        `/trafficincidents?suburbIds[]=1&startDate=2022-08-01&endDate[]=2022-08-08`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be a string");
    });
  });
});
