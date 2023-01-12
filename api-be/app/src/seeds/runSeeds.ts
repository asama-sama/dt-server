import { Seed } from "../db/models/Seed";
import { logger } from "../util/logger";
import { seed as updateFrequencySeed } from "./updateFrequency";

export type SeedRunner = {
  name: string;
  seedFunction: (value: void) => Promise<void>;
};

const seeds: SeedRunner[] = [
  { name: "airQualityReading", seedFunction: updateFrequencySeed },
];

export const runSeed = async (seed: SeedRunner) => {
  try {
    const processedSeed = await Seed.findOne({
      where: { name: seed.name, processed: true },
    });
    if (processedSeed) return;
    logger(`run seed ${seed.name}`);
    await seed.seedFunction();
    await Seed.create({ name: seed.name, processed: true });
  } catch (e) {
    if (e instanceof Error) {
      await Seed.create({
        name: seed.name,
        processed: false,
        message: e.message,
      });
    }
  }
};

export const runSeeds = async () => {
  for (const seed of seeds) {
    await runSeed(seed);
  }
};
