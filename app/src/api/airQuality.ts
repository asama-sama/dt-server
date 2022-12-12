import express, { NextFunction, Request, Response } from "express";
import {
  getAirQualitySiteReadings,
  getAirQualitySites,
  getMonthlyObservations,
} from "../controllers/airQuality";
import { GeoData } from "../customTypes/api";
import { isArray, isValidDate, isValidNumber } from "../util/validators";

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
  aggregate: string;
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
        aggregate: _aggregate,
      } = req.query;

      const airQualitySiteIdsArray = isArray(_airQualitySiteIds);
      const airQualitySiteIds = airQualitySiteIdsArray.map((siteId) =>
        isValidNumber(siteId)
      );

      const startDate = isValidDate(_startDate);
      let endDate: Date | undefined;
      if (_endDate) {
        endDate = isValidDate(_endDate);
      } else {
        endDate = new Date();
      }

      if (
        _aggregate !== "day" &&
        _aggregate !== "month" &&
        _aggregate !== "year"
      ) {
        throw new Error("aggregate must be one of day/month/year");
      }
      const aggregate = _aggregate;

      const readings = await getAirQualitySiteReadings(
        airQualitySiteIds,
        startDate,
        endDate,
        aggregate
      );
      res.status(200).send(readings);
    } catch (e) {
      next(e);
    }
  }
);

// initial data required for fetching air quality site data
router.get(
  "/pre",
  async (req: Request, res: Response<GeoData[]>, next: NextFunction) => {
    try {
      const sites = await getAirQualitySites();
      return res.status(200).send(sites);
    } catch (e) {
      next(e);
    }
  }
);

export { router as airQualityRoutes };
