import express, { Request, Response } from "express";
import {
  getStationCountsByMonth,
  getStations,
} from "../clients/nswTrafficVolume";

const router = express.Router();

type MonthlyTrafficVolumeRequestParams = {
  year: string;
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
      const counts = await getStationCountsByMonth(yearInt);
      res.status(200).send(counts);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/station", async (req, res, next) => {
  try {
    const stations = await getStations();
    res.status(200).send(stations);
  } catch (e) {
    next(e);
  }
});

export { router as trafficVolumeRoutes };
