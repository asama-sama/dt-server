import express, { NextFunction, Request, Response } from "express";
import {
  getAirQualitySiteReadings,
  getMonthlyObservations,
} from "../controllers/airQuality";
import { ResponseError } from "../customTypes/ResponseError";
import { isValidDate } from "../util/expressValidators";

const router = express.Router();

type AirQualityRequestQPs = {
  sites: string;
};

router.get(
  "/monthly",
  async (
    req: Request<undefined, undefined, undefined, AirQualityRequestQPs>,
    res: Response,
    next
  ) => {
    try {
      const sites: number[] = JSON.parse(req.query.sites);
      const observations = await getMonthlyObservations(sites);
      res.status(200).send(observations);
    } catch (e) {
      next(e);
    }
  }
);

type GetAirQualitySiteReadingParams = {
  airQualitySiteId: string;
  startDate: string;
  endDate?: string;
};

router.get(
  "/",
  async (
    req: Request<null, null, GetAirQualitySiteReadingParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        airQualitySiteId: _airQualitySiteId,
        startDate: _startDate,
        endDate: _endDate,
      } = req.query;
      const airQualitySiteId = Number(_airQualitySiteId);
      if (isNaN(airQualitySiteId))
        throw new ResponseError("airQualitySiteId must be a number", 400);

      const startDate = isValidDate(_startDate);
      let endDate: Date | undefined;
      if (_endDate) endDate = isValidDate(_endDate);
      const readings = await getAirQualitySiteReadings(
        airQualitySiteId,
        startDate,
        endDate
      );
      res.status(200).send(readings);
    } catch (e) {
      next(e);
    }
  }
);

export { router as airQualityRoutes };
