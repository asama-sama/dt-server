import express from "express";
import { emissions } from "./emissions";
import { suburbs } from "./suburbs";
import { categories } from "./categories";
import { apis } from "./apis";

const router = express.Router();

router.use("/emissions", emissions);
router.use("/suburbs", suburbs);
router.use("/categories", categories);
router.use("/apis", apis);

export { router as routes };
