import { ResponseError } from "../customTypes/ResponseError";

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
