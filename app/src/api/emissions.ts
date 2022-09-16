import express from "express";
// import { getYears } from "../controllers/emissions";

const router = express.Router();

// router.get("/years", async (req, res) => {
//   const results = await getYears();
//   res.status(200).send(results);
// });

export { router as emissions };
