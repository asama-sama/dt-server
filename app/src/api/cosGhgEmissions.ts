import express, { NextFunction, Request, Response } from "express";
import { getEmissionsBySuburb } from "../controllers/cosGhgEmissions";
import { ResponseError } from "../customTypes/ResponseError";

const router = express.Router();

type EmissionsBySuburbQueryParams = {
  categories: string[];
  year: string;
  sort: "ASC" | "DESC";
};

router.get(
  "/suburb",
  async (
    request: Request<null, null, EmissionsBySuburbQueryParams>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const {
        categories: categoriesParam,
        year: yearParam,
        order: orderParam,
      } = request.query;
      if (categoriesParam && !Array.isArray(categoriesParam)) {
        throw new ResponseError("categories must be an array", 400);
      }
      const categories = <string[]>categoriesParam;

      if (yearParam && isNaN(Number(yearParam))) {
        throw new ResponseError("year must be a number", 400);
      }
      const year = Number(yearParam) || undefined;

      if (
        orderParam !== undefined &&
        (typeof orderParam !== "string" ||
          (orderParam.toUpperCase() !== "ASC" &&
            orderParam.toUpperCase() !== "DESC"))
      ) {
        throw new ResponseError(`sort must be 'ASC' or 'DESC'`);
      }

      const order = <"ASC" | "DESC" | undefined>orderParam?.toUpperCase();

      const emissionsBySuburb = await getEmissionsBySuburb({
        categories: categories,
        order,
        year,
      });

      response.status(200).send(emissionsBySuburb);
    } catch (e) {
      next(e);
    }
  }
);

export { router as cosGhgEmissions };
