import { Seed } from "../db/models/Seed";
import { logger } from "../util/logger";

export type SeedRunner = {
  name: string;
  seedFunction: (value: void) => Promise<void>;
};

export const runSeeds = async (seeds: SeedRunner[]) => {
  for (const seed of seeds) {
    try {
      const processedSeed = await Seed.findOne({
        where: { name: seed.name, processed: true },
      });
      if (processedSeed) continue;
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
  }
};