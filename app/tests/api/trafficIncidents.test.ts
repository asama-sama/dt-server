/// <reference types="@types/jest" />;
import request from "supertest";
import { app } from "../../src/app";
import { AIR_QUALITY_SITE_SEARCH_RADIUS } from "../../src/const/trafficIncidents";
import { getTrafficIncidentsNearPosition } from "../../src/controllers/nswTrafficIncidents";

jest.mock("../../src/controllers/nswTrafficIncidents", () => {
  return {
    __esModule: true,
    getTrafficIncidentsNearPosition: jest.fn(),
  };
});

const getTrafficIncidentsNearPositionMock =
  getTrafficIncidentsNearPosition as jest.MockedFunction<
    typeof getTrafficIncidentsNearPosition
  >;

describe("trafficIncidents api", () => {
  describe("get", () => {
    test("it should call getTrafficIncidentsNearPosition with the correct parameters", async () => {
      const res = await request(app).get(
        "/trafficIncidents?lat=10&lng=15&startDate=2022-08-05"
      );
      expect(res.status).toBe(200);
      expect(getTrafficIncidentsNearPositionMock).toHaveBeenCalledWith(
        {
          lat: 10,
          lng: 15,
        },
        AIR_QUALITY_SITE_SEARCH_RADIUS,
        new Date("2022-08-05"),
        undefined
      );
    });

    test("it should throw an error if lat or lng is invalid", async () => {
      let res = await request(app).get("/trafficIncidents?lat=aaaa&lng=15");
      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid position value given");

      res = await request(app).get("/trafficIncidents?lat=10&lng=aaa15");
      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid position value given");
    });

    test("it should throw an error if startDate is invalid", async () => {
      const startDate = "invalid";
      let res = await request(app).get(
        `/trafficIncidents?lat=10&lng=15&startDate=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("startDate must be valid");

      res = await request(app).get(
        `/trafficIncidents?lat=10&lng=15&startDate[]=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("startDate must be a string");
    });

    test("it should throw an error if endDate is invalid", async () => {
      let res = await request(app).get(
        `/trafficIncidents?lat=10&lng=15&startDate=2022-08-01&endDate=invalid`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("endDate must be valid");

      res = await request(app).get(
        `/trafficIncidents?lat=10&lng=15&startDate=2022-08-01&endDate[]=2022-08-08`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("endDate must be a string");
    });
  });
});
