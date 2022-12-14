import express, { NextFunction, Request, Response } from "express";
import { getStations } from "../clients/nswTrafficVolume";
import { getAllStations, getCounts } from "../controllers/trafficVolume";
import { DatewiseCategorySums, GeoData } from "../customTypes/api";
import {
  isArray,
  isValidDate,
  isValidNumber,
  isValidTemporalAggregate,
} from "../util/validators";

const router = express.Router();

router.get(
  "/stations",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stations = await getStations();
      res.status(200).send(stations);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/pre",
  async (req: Request, res: Response<GeoData[]>, next: NextFunction) => {
    try {
      const stations = await getAllStations();
      res.status(200).send(stations);
    } catch (e) {
      next(e);
    }
  }
);

type ReadingsRequestParams = {
  stationIds: string[];
  startDate: string;
  endDate: string;
  aggregate: string;
};

router.get(
  "/",
  async (
    req: Request<null, null, ReadingsRequestParams>,
    res: Response<DatewiseCategorySums>,
    next: NextFunction
  ) => {
    try {
      const {
        stationIds: _stationIds,
        startDate: _startDate,
        endDate: _endDate,
        aggregate: _aggregate,
      } = req.query;

      const stationIdsArray = isArray(_stationIds);
      const stationIds = stationIdsArray.map((suburbId) =>
        isValidNumber(suburbId)
      );

      const startDate = isValidDate(_startDate);
      const endDate = isValidDate(_endDate);

      const aggregate = isValidTemporalAggregate(_aggregate);

      const counts = await getCounts(stationIds, startDate, endDate, aggregate);
      res.status(200).send(counts);
    } catch (e) {
      next(e);
    }
  }
);

export { router as trafficVolumeRoutes };
