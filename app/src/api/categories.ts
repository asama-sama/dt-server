import express from "express";
// import { get, getEmissionsByCategory } from "../controllers/categories";

const router = express.Router();

// router.get("/", async (req, res) => {
//   const categories = await get();
//   res.status(200).send(categories);
// });

// router.get("/emissions", async (req, res) => {
//   const emissions = await getEmissionsByCategory();
//   res.status(200).send(emissions);
// });

export { router as categories };
