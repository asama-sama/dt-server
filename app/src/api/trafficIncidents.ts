import express, { NextFunction, Request, Response } from "express";
import { getTrafficIncidentsNearPosition } from "../controllers/nswTrafficIncidents";
import { isValidDate, isValidNumber } from "../util/expressValidators";

const router = express.Router();

type GetTrafficIncidentParams = {
  lat: string;
  lng: string;
  startDate: string;
  endDate: string;
  radius: string;
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
        lat: _lat,
        lng: _lng,
        startDate: _startDate,
        endDate: _endDate,
        radius: _radius,
      } = request.query;

      const lat = isValidNumber(_lat);
      const lng = isValidNumber(_lng);
      const radius = isValidNumber(_radius);

      const startDate = isValidDate(_startDate);
      let endDate: Date | undefined;
      if (_endDate) {
        endDate = isValidDate(_endDate);
      }

      const incidentCounts = await getTrafficIncidentsNearPosition(
        { lat, lng },
        radius,
        startDate,
        endDate
      );
      return response.status(200).send(incidentCounts);
    } catch (e) {
      return next(e);
    }
  }
);

export { router as trafficIncidentRoutes };
