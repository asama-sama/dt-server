import express from "express";
import { emissions } from "./emissions";

const router = express.Router();

router.use(emissions);

export { router as routes };
