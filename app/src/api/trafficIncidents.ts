import express, { NextFunction, Request, Response } from "express";
import { TRAFFIC_SEARCH_LOCATIONS } from "../const/trafficIncidents";
import { getTrafficIncidentsForSuburbs } from "../controllers/nswTrafficIncidents";
import { isArray, isValidDate, isValidNumber } from "../util/expressValidators";

const router = express.Router();

type GetTrafficIncidentParams = {
  suburbIds: number[];
  startDate: string;
  endDate: string;
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
      } = request.query;

      const suburbIdArray = isArray(_suburbIds);
      const suburbIds = suburbIdArray.map((id) => isValidNumber(id));

      const startDate = isValidDate(_startDate);
      let endDate: Date | undefined;
      if (_endDate) {
        endDate = isValidDate(_endDate);
      }

      const incidentCounts = await getTrafficIncidentsForSuburbs(
        suburbIds,
        startDate,
        endDate
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
