import express from "express";
import { emissions } from "./emissions";
import { suburbs } from "./suburbs";
import { categories } from "./categories";
import { apis } from "./apis";
import { airQualityRoutes } from "./airQuality";
import { trafficVolumeRoutes } from "./trafficVolume";

const router = express.Router();

router.use("/emissions", emissions);
router.use("/suburbs", suburbs);
router.use("/categories", categories);
router.use("/apis", apis);
router.use("/airquality", airQualityRoutes);
router.use("/trafficvolume", trafficVolumeRoutes);

export { router as routes };
