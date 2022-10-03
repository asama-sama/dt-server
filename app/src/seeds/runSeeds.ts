import { seed as airQualityReadingSeed } from "./airQualityReadings";
import { seed as airQualitySitesSeed } from "./airQualitySites";
import { seed as trafficVolumeStationsSeed } from "./trafficVolumeStations";

export const runSeeds = async () => {
  await airQualityReadingSeed();
  await airQualitySitesSeed();
  await trafficVolumeStationsSeed();
};
