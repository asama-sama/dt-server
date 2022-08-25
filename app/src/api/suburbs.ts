import express, { Request, Response } from "express";
import {
  get,
  getEmissionsBySuburb,
  getYearlyEmissionsBySuburb,
} from "../controllers/suburbs";
import { Emission } from "../db/models/Emission";

const router = express.Router();

router.get("/", async (req, res) => {
  const results = await get();
  res.status(200).send(results);
});

type EmissionQueryParams = {
  categories: string;
  year: string;
  sort: string;
};

router.get(
  "/emissions",
  async (
    req: Request<never, never, never, EmissionQueryParams>,
    res: Response<Emission[]>,
    next
  ) => {
    try {
      const categories = req.query.categories
        ? JSON.parse(req.query.categories)
        : undefined;
      const year = parseInt(req.query.year);
      const sort = req.query.sort;
      const results = await getEmissionsBySuburb(categories, year, sort);
      res.status(200).send(results);
    } catch (e) {
      next(e);
    }
  }
);

type YearlyEmissionQueryParams = {
  categories?: string;
};

router.get(
  "/emissions/yearly",
  async (
    req: Request<never, never, never, YearlyEmissionQueryParams>,
    res: Response,
    next
  ) => {
    try {
      const categories = req.query.categories
        ? JSON.parse(req.query.categories)
        : undefined;
      const results = await getYearlyEmissionsBySuburb(categories);
      res.status(200).send(results);
    } catch (e) {
      next(e);
    }
  }
);

export { router as suburbs };
