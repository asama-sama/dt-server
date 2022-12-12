import express, { NextFunction, Request, Response } from "express";
import { TRAFFIC_SEARCH_LOCATIONS } from "../const/trafficIncidents";
import { getTrafficIncidentsForSuburbs } from "../controllers/nswTrafficIncidents";
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

router.get("/searchparams", async (req: Request, res: Response) => {
  res.status(200).send(TRAFFIC_SEARCH_LOCATIONS);
});

export { router as trafficIncidentRoutes };
