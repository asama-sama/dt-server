import express, { Request, Response } from "express";
import { getAll } from "../controllers/apis";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const apis = await getAll();
  res.status(200).send(apis);
});

export { router as apis };
