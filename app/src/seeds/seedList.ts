import { SeedRunner } from "./runSeeds";
import { seed as airQualityReadingSeed } from "../seeds/airQualityReadings";
import { seed as airQualitySitesSeed } from "../seeds/airQualitySites";
import { seed as trafficVolumeStationsSeed } from "../seeds/trafficVolumeStations";
import { seed as trafficVolumeReadingsSeed } from "../seeds/trafficVolumeReadings";
import { seed as crimeBySuburb } from "../seeds/crimeBySuburb";
import { seed as cosGhgEmissions } from "../seeds/cosGhgEmissions";
import { seed as trafficIncidents } from "./trafficIncidents";
import { seedTypes as bomReadingTypes } from "./bomReadingTypes";

export const seeds: SeedRunner[] = [
  { name: "airQualityReading", seedFunction: airQualityReadingSeed },
  { name: "airQualitySite", seedFunction: airQualitySitesSeed },
  { name: "trafficVolumeStations", seedFunction: trafficVolumeStationsSeed },
  { name: "trafficVolumeReading", seedFunction: trafficVolumeReadingsSeed },
  { name: "crimeBySuburb", seedFunction: crimeBySuburb },
  { name: "cosGhgEmissions", seedFunction: cosGhgEmissions },
  { name: "trafficIncidents", seedFunction: trafficIncidents },
  { name: "bomReadingTypes", seedFunction: bomReadingTypes },
];
