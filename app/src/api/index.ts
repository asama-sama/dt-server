import express from "express";
import { emissions } from "./emissions";
import { suburbs } from "./suburbs";
import { categories } from "./categories";

const router = express.Router();

router.use("/emissions", emissions);
router.use("/suburbs", suburbs);
router.use("/categories", categories);

export { router as routes };
