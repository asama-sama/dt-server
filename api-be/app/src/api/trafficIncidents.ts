import express, { NextFunction, Request, Response } from "express";
import { TRAFFIC_SEARCH_LOCATIONS } from "../const/trafficIncidents";
import { getTrafficIncidentsForSuburbs } from "../controllers/nswTrafficIncidents";
import { getByPosition } from "../controllers/suburbs";
import { GeoData } from "../customTypes/api";
import { TemporalAggregate } from "../customTypes/suburb";
import {
  isArray,
  isValidDate,
  isValidNumber,
  isValidTemporalAggregate,
} from "../util/validators";

const router = express.Router();

type GetTrafficIncidentParams = {
  suburbIds: number[];
  startDate: string;
  endDate: string;
  aggregate: TemporalAggregate;
};

router.get(
  "/",
  async (
    request: Request<null, null, GetTrafficIncidentParams>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const {
        startDate: _startDate,
        endDate: _endDate,
        suburbIds: _suburbIds,
        aggregate: _aggregate,
      } = request.query;

      const suburbIdArray = isArray(_suburbIds);
      const suburbIds = suburbIdArray.map((id) => isValidNumber(id));

      const startDate = isValidDate(_startDate);
      const aggregate = isValidTemporalAggregate(_aggregate);

      let endDate: Date | undefined;
      if (_endDate) {
        endDate = isValidDate(_endDate);
      } else {
        endDate = new Date();
      }

      const incidentCounts = await getTrafficIncidentsForSuburbs(
        suburbIds,
        startDate,
        endDate,
        aggregate
      );
      return response.status(200).send(incidentCounts);
    } catch (e) {
      return next(e);
    }
  }
);

type SearchParams = {
  latitude: number;
  longitude: number;
  radius: number; // receive in km
};
// initial suburb data required for fetching traffic incidents
router.get(
  "/pre",
  async (
    request: Request<null, null, SearchParams>,
    response: Response<GeoData[]>,
    next: NextFunction
  ) => {
    try {
      const {
        latitude: _latitude,
        longitude: _longitude,
        radius: _radius,
      } = request.query;
      const latitude = isValidNumber(_latitude);
      const longitude = isValidNumber(_longitude);
      const radius = isValidNumber(_radius);
      const suburbs = await getByPosition(longitude, latitude, radius * 1000);
      response.status(200).send(suburbs);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/searchparams", async (req: Request, res: Response) => {
  res.status(200).send(TRAFFIC_SEARCH_LOCATIONS);
});

export { router as trafficIncidentRoutes };
