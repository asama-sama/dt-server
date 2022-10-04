import { seed as airQualityReadingSeed } from "./airQualityReadings";
import { seed as airQualitySitesSeed } from "./airQualitySites";
import { seed as trafficVolumeStationsSeed } from "./trafficVolumeStations";
import { seed as trafficVolumeReadingsSeed } from "./trafficVolumeReadings";

export const runSeeds = async () => {
  await airQualityReadingSeed();
  await airQualitySitesSeed();
  await trafficVolumeStationsSeed();
  await trafficVolumeReadingsSeed();
};
