import express, { NextFunction, Request, Response } from "express";
import { AIR_QUALITY_SITE_SEARCH_RADIUS } from "../const/trafficIncidents";
import { getTrafficIncidentsNearPosition } from "../controllers/nswTrafficIncidents";
import { ResponseError } from "../customTypes/ResponseError";

const router = express.Router();

type GetTrafficIncidentParams = {
  lat: string;
  lng: string;
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
        lat: _lat,
        lng: _lng,
        startDate: _startDate,
        endDate: _endDate,
      } = request.query;

      const lat = Number(_lat);
      const lng = Number(_lng);
      if (isNaN(lat) || isNaN(lng))
        throw new ResponseError("Invalid position value given", 400);

      if (typeof _startDate !== "string") {
        throw new ResponseError("startDate must be a string", 400);
      }
      const startDate = new Date(_startDate);
      let endDate: Date | undefined;
      if (_endDate && typeof _endDate !== "string") {
        throw new ResponseError("endDate must be a string", 400);
      }
      if (_endDate) {
        endDate = new Date(_endDate);
      }
      if (_endDate) endDate = new Date(_endDate);
      if (startDate.toString() === "Invalid Date") {
        throw new ResponseError("startDate must be valid", 400);
      }
      if (endDate && endDate.toString() === "Invalid Date") {
        throw new ResponseError("endDate must be valid", 400);
      }

      const incidentCounts = await getTrafficIncidentsNearPosition(
        { lat, lng },
        AIR_QUALITY_SITE_SEARCH_RADIUS,
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
