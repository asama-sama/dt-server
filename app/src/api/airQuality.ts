import express, { Request, Response } from "express";
import { getObservations } from "../controllers/airQuality";

const router = express.Router();

type AirQualityRequestQPs = {
  sites: string;
};

router.get(
  "/",
  async (
    req: Request<undefined, undefined, undefined, AirQualityRequestQPs>,
    res: Response,
    next
  ) => {
    try {
      const sites: number[] = JSON.parse(req.query.sites);
      const observations = await getObservations(sites);
      res.status(200).send(observations);
    } catch (e) {
      next(e);
    }
  }
);

export { router as airQualityRoutes };
