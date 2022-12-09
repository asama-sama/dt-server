import express, { NextFunction, Request, Response } from "express";
import { getAll, getByPosition, getSuburbsById } from "../controllers/suburbs";
import { ResponseError } from "../customTypes/ResponseError";
import { Suburb } from "../db/models/Suburb";
import { isValidNumber } from "../util/expressValidators";

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

router.get(
  "/all",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const suburbs = await getAll();
      response.status(200).send(suburbs);
    } catch (e) {
      next(e);
    }
  }
);

type SearchParams = {
  latitude: number;
  longitude: number;
  radius: number; // receive in km
};
router.get(
  "/byposition",
  async (
    request: Request<null, null, SearchParams>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const {
        latitude: _latitude,
        longitude: _longitude,
        radius: _radius,
      } = request.query;
      const latitude = isValidNumber(_latitude);
      const longitude = isValidNumber(_longitude);
      const radius = isValidNumber(_radius);
      const suburbs = await getByPosition(longitude, latitude, radius * 1000);
      console.log(suburbs.length);
      response.status(200).send(suburbs);
    } catch (e) {
      next(e);
    }
  }
);

export { router as suburbs };
