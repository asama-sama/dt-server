/// <reference types="@types/jest" />;
import request from "supertest";
import { app } from "../../src/app";
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
        "/trafficincidents?lat=10&lng=15&radius=3000&startDate=2022-08-05"
      );
      expect(res.status).toBe(200);
      expect(getTrafficIncidentsNearPositionMock).toHaveBeenCalledWith(
        {
          lat: 10,
          lng: 15,
        },
        3000,
        new Date("2022-08-05"),
        undefined
      );
    });

    test("it should throw an error if lat or lng is invalid", async () => {
      let res = await request(app).get("/trafficincidents?lat=aaaa&lng=15");
      expect(res.status).toBe(400);
      expect(res.text).toBe("must be a number");

      res = await request(app).get("/trafficincidents?lat=10&lng=aaa15");
      expect(res.status).toBe(400);
      expect(res.text).toBe("must be a number");
    });

    test("it should throw an error if startDate is invalid", async () => {
      const startDate = "invalid";
      let res = await request(app).get(
        `/trafficincidents?lat=10&lng=15&radius=3000&startDate=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");

      res = await request(app).get(
        `/trafficincidents?lat=10&lng=15&radius=3000&startDate[]=${startDate}`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be a string");
    });

    test("it should throw an error if endDate is invalid", async () => {
      let res = await request(app).get(
        `/trafficincidents?lat=10&lng=1&radius=30005&startDate=2022-08-01&endDate=invalid`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");

      res = await request(app).get(
        `/trafficincidents?lat=10&lng=15&radius=3000&startDate=2022-08-01&endDate[]=2022-08-08`
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be a string");
    });
  });
});
