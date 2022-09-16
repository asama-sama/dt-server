import express from "express";
import { suburbs } from "./suburbs";
import { apis } from "./apis";
import { airQualityRoutes } from "./airQuality";
import { trafficVolumeRoutes } from "./trafficVolume";

const router = express.Router();

router.use("/suburbs", suburbs);
router.use("/apis", apis);
router.use("/airquality", airQualityRoutes);
router.use("/trafficvolume", trafficVolumeRoutes);

export { router as routes };
