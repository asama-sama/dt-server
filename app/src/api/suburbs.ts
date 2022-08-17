import express from "express";
import { get } from "../controllers/suburbs";

const router = express.Router();

router.get("/", async (req, res) => {
  const results = await get();
  res.status(200).send(results);
});

export { router as suburbs };
