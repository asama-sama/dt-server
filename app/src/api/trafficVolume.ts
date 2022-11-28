import express, { NextFunction, Request, Response } from "express";
import { getStations } from "../clients/nswTrafficVolume";

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

export { router as trafficVolumeRoutes };
