import express, { Request, Response } from "express";
import { get, getYears } from "../controllers/emissions";
import { Emission } from "../db/models/Emission";

const router = express.Router();

type EmissionQueryParams = {
  categories: string;
  year: string;
  sort: string;
};

router.get(
  "/",
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
      const results = await get(categories, year, sort);
      res.status(200).send(results);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/years", async (req, res) => {
  const results = await getYears();
  res.status(200).send(results);
});

export { router as emissions };
