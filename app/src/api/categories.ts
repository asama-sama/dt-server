import express from "express";
import { get } from "../controllers/categories";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await get();
  res.status(200).send(categories);
});

export { router as categories };
