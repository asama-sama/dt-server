import express from "express";
import { get } from "../controllers/emissions";

const router = express.Router();

router.get("/emissions", async (req, res, next) => {
  const results = await get();
  res.status(200).send(results);
});

export { router as emissions };
