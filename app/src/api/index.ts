import express from "express";
import { suburbs } from "./suburbs";
import { apis } from "./apis";
import { airQualityRoutes } from "./airQuality";
import { trafficVolumeRoutes } from "./trafficVolume";
import { cosGhgEmissions } from "./cosGhgEmissions";
import { trafficIncidentRoutes } from "./trafficIncidents";

const router = express.Router();

router.use("/suburbs", suburbs);
router.use("/apis", apis);
router.use("/airquality", airQualityRoutes);
router.use("/trafficvolume", trafficVolumeRoutes);
router.use("/cosghgemissions", cosGhgEmissions);
router.use("/trafficIncidents", trafficIncidentRoutes);

export { router as routes };
