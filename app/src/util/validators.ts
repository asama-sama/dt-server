import { ResponseError } from "../customTypes/ResponseError";
import { TemporalAggregate } from "../customTypes/suburb";

export const isValidDate = (date: unknown): Date => {
  if (typeof date !== "string") {
    throw new ResponseError("date must be a string", 400);
  }
  const newDate = new Date(date);
  if (newDate.toString() === "Invalid Date") {
    throw new ResponseError("date must be valid", 400);
  }
  return newDate;
};

export const isValidNumber = (number: unknown): number => {
  const parsedNumber = Number(number);
  if (isNaN(parsedNumber)) {
    throw new ResponseError("must be a number", 400);
  }
  return parsedNumber;
};

export const isArray = (array: unknown): unknown[] => {
  if (!Array.isArray(array)) {
    throw new ResponseError("must be an array", 400);
  }
  return array;
};

export const isValidTemporalAggregate = (
  aggregate: unknown
): TemporalAggregate => {
  if (aggregate !== "day" && aggregate !== "month" && aggregate !== "year") {
    throw new ResponseError(
      "Aggregate time must be one of day/month/year",
      400
    );
  }
  return aggregate;
};
