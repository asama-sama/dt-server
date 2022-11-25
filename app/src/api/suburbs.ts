import express, { NextFunction, Request, Response } from "express";
import { getSuburbsById } from "../controllers/suburbs";
import { ResponseError } from "../customTypes/ResponseError";
import { Suburb } from "../db/models/Suburb";

const router = express.Router();

type SuburbQueryParams = {
  suburbIds?: string[];
};

router.get(
  "/",
  async (
    request: Request<null, null, SuburbQueryParams>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { suburbIds: suburbIdsParams } = request.query;
      let suburbIds: number[] | undefined = undefined;
      if (suburbIdsParams) {
        if (!Array.isArray(suburbIdsParams)) {
          throw new ResponseError("suburbIds must be an array", 400);
        }
        suburbIds = suburbIdsParams.map((id) => {
          const num = Number(id);
          if (isNaN(num))
            throw new ResponseError("suburbIds must be numbers", 400);
          return num;
        });
      } else {
        throw new ResponseError("suburbIds cannot be empty", 400);
      }
      const suburbs: Suburb[] = await getSuburbsById(suburbIds);

      response.status(200).send(suburbs);
    } catch (e) {
      next(e);
    }
  }
);

export { router as suburbs };
