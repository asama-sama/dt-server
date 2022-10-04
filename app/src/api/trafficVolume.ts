import express, { Request, Response } from "express";
import {
  getStationCountsByMonth,
  getStations,
} from "../clients/nswTrafficVolume";

const router = express.Router();

type MonthlyTrafficVolumeRequestParams = {
  year: string;
  stationIds: string;
};

router.get(
  "/monthly",
  async (
    req: Request<
      undefined,
      undefined,
      undefined,
      MonthlyTrafficVolumeRequestParams
    >,
    res: Response,
    next
  ) => {
    try {
      const yearInt: number = parseInt(req.query.year);
      const stationIds: string[] = JSON.parse(req.query.stationIds);
      const counts = await getStationCountsByMonth(stationIds);
      res.status(200).send(counts);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/stations", async (req, res, next) => {
  try {
    const stations = await getStations();
    res.status(200).send(stations);
  } catch (e) {
    next(e);
  }
});

export { router as trafficVolumeRoutes };
