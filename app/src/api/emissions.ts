import express from "express";
import { get, getAggregate } from "../controllers/emissions";

const router = express.Router();

router.get("/", async (req, res) => {
  const results = await get();
  res.status(200).send(results);
});

router.get("/aggregate", async (req, res) => {
  const results = await getAggregate();
  res.status(200).send(results);
});

export { router as emissions };
