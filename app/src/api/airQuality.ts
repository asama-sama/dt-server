import express, { NextFunction, Request, Response } from "express";
import {
  getAirQualitySiteReadings,
  getAirQualitySites,
  getMonthlyObservations,
} from "../controllers/airQuality";
import { ResponseError } from "../customTypes/ResponseError";
import { isArray, isValidDate, isValidNumber } from "../util/expressValidators";

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
  airQualitySiteIds: string[];
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
        airQualitySiteIds: _airQualitySiteIds,
        startDate: _startDate,
        endDate: _endDate,
      } = req.query;

      const airQualitySiteIdsArray = isArray(_airQualitySiteIds);
      const airQualitySiteIds = airQualitySiteIdsArray.map((siteId) =>
        isValidNumber(siteId)
      );

      const startDate = isValidDate(_startDate);
      let endDate: Date | undefined;
      if (_endDate) endDate = isValidDate(_endDate);
      const readings = await getAirQualitySiteReadings(
        airQualitySiteIds,
        startDate,
        endDate
      );
      res.status(200).send(readings);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/sites",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sites = await getAirQualitySites();
      return res.status(200).send(sites);
    } catch (e) {
      next(e);
    }
  }
);

export { router as airQualityRoutes };
