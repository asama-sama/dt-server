import express, { NextFunction, Request, Response } from "express";
import { AIR_QUALITY_SITE_SEARCH_RADIUS } from "../const/trafficIncidents";
import { getTrafficIncidentsNearPosition } from "../controllers/nswTrafficIncidents";
import { ResponseError } from "../customTypes/ResponseError";

const router = express.Router();

type GetTrafficIncidentParams = {
  lat: string;
  lng: string;
};

router.get(
  "/",
  async (
    request: Request<null, null, GetTrafficIncidentParams>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { lat: _lat, lng: _lng } = request.query;

      const lat = Number(_lat);
      const lng = Number(_lng);
      if (isNaN(lat) || isNaN(lng))
        throw new ResponseError("Invalid position value given");
      const incidentCounts = await getTrafficIncidentsNearPosition(
        { lat, lng },
        AIR_QUALITY_SITE_SEARCH_RADIUS
      );
      return response.status(200).send(incidentCounts);
    } catch (e) {
      return next(e);
    }
  }
);

export { router as trafficIncidentRoutes };
