import express, { Request, Response } from "express";
import {
  getCurrentObservations,
  getMonthlyObservations,
} from "../controllers/airQuality";

const router = express.Router();

type AirQualityRequestQPs = {
  sites: string;
};

router.get(
  "/monthly",
  async (
    req: Request<undefined, undefined, undefined, AirQualityRequestQPs>,
    res: Response,
    next
  ) => {
    try {
      const sites: number[] = JSON.parse(req.query.sites);
      const observations = await getMonthlyObservations(sites);
      res.status(200).send(observations);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/live",
  async (
    req: Request<undefined, undefined, undefined, AirQualityRequestQPs>,
    res: Response,
    next
  ) => {
    try {
      const sites: number[] = JSON.parse(req.query.sites);
      const observations = await getCurrentObservations(sites);
      res.status(200).send(observations);
    } catch (e) {
      next(e);
    }
  }
);

export { router as airQualityRoutes };
