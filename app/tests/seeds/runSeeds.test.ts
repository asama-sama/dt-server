/// <reference types="@types/jest" />;
import { Seed } from "../../src/db/models/Seed";
import { runSeed, SeedRunner } from "../../src/seeds/runSeeds";

const seed1Mock = jest.fn();

const seed: SeedRunner = {
  name: "seed1",
  seedFunction: seed1Mock,
};

describe("runSeed", () => {
  beforeEach(async () => {
    await Seed.destroy({ truncate: true });
    await runSeed(seed);
  });

  test("it should run both seed functions", () => {
    expect(seed1Mock).toHaveBeenCalled();
  });

  test("it should create Seed entries in the database", async () => {
    const seeds = await Seed.findAll();
    expect(seeds.length).toBe(1);
    for (const seed of seeds) {
      expect(seed.processed).toBe(true);
    }
  });

  test("it should not add an entry if the seed function throws an error", async () => {
    seed1Mock.mockRejectedValueOnce(new Error("error"));
    await Seed.destroy({ truncate: true });
    await runSeed(seed);
    const seedRow = await Seed.findOne({
      where: {
        name: seed.name,
      },
    });
    if (!seedRow) throw new Error("No Seeds found");
    expect(seedRow.processed).toBe(false);
  });

  test("it should not run seeds again if they have been processed", async () => {
    await runSeed(seed);
    const seedRows = await Seed.findAll();
    expect(seedRows.length).toBe(1);
  });
});
