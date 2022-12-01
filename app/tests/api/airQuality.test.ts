/// <reference types="@types/jest" />;
import request from "supertest";
import { getAirQualitySiteReadings } from "../../src/controllers/airQuality";
import { app } from "../../src/app";

jest.mock("../../src/controllers/airQuality", () => {
  return {
    __esModule: true,
    getAirQualitySiteReadings: jest.fn(),
  };
});

const getAirQualitySiteReadingsMock =
  getAirQualitySiteReadings as jest.MockedFunction<
    typeof getAirQualitySiteReadings
  >;

describe("airQuality routes", () => {
  describe("get", () => {
    test("it should call getAirQualitySiteReadings", async () => {
      const res = await request(app).get(
        "/airquality?airQualitySiteId=1&startDate=2022-08-01&endDate=2022-08-02"
      );
      expect(res.status).toBe(200);
      expect(getAirQualitySiteReadingsMock).toHaveBeenCalledWith(
        1,
        new Date("2022-08-01"),
        new Date("2022-08-02")
      );
    });

    test("it should error if airQualitySiteId is invalid", async () => {
      const res = await request(app).get("/airquality?airQualitySiteId=aaa");
      expect(res.status).toBe(400);
      expect(res.text).toBe("airQualitySiteId must be a number");
    });

    test("it should error if startDate is invalid", async () => {
      const res = await request(app).get(
        "/airquality?airQualitySiteId=1&startDate=a"
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");
    });

    test("it should error if endDate is invalid", async () => {
      const res = await request(app).get(
        "/airquality?airQualitySiteId=1&startDate=2022-08-01&endDate=a"
      );
      expect(res.status).toBe(400);
      expect(res.text).toBe("date must be valid");
    });
  });
});
