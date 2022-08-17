import express from "express";
import { emissions } from "./emissions";
import { suburbs } from "./suburbs";

const router = express.Router();

router.use(emissions);
router.use(suburbs);

export { router as routes };
