/// <reference types="@types/jest" />;
import { Seed } from "../../src/db/models/Seed";
import { runSeeds, SeedRunner } from "../../src/seeds/runSeeds";

const seed1Mock = jest.fn();
const seed2Mock = jest.fn();

const seeds: SeedRunner[] = [
  {
    name: "seed1",
    seedFunction: seed1Mock,
  },
  {
    name: "seed2",
    seedFunction: seed2Mock,
  },
];

describe("runSeeds", () => {
  beforeEach(async () => {
    await Seed.destroy({ truncate: true });
    await runSeeds(seeds);
  });

  test("it should run both seed functions", () => {
    expect(seed1Mock).toHaveBeenCalled();
    expect(seed2Mock).toHaveBeenCalled();
  });

  test("it should create Seed entries in the database", async () => {
    const seeds = await Seed.findAll();
    expect(seeds.length).toBe(2);
    for (const seed of seeds) {
      expect(seed.processed).toBe(true);
    }
  });

  test("it should not add an entry if the seed function throws an error", async () => {
    seed1Mock.mockRejectedValueOnce(new Error("error"));
    await Seed.destroy({ truncate: true });
    await runSeeds(seeds);
    const seedRow = await Seed.findOne({
      where: {
        name: seeds[0].name,
      },
    });
    if (!seedRow) throw new Error("No Seeds found");
    expect(seedRow.processed).toBe(false);
  });

  test("it should not run seeds again if they have been processed", async () => {
    await runSeeds(seeds);
    const seedRows = await Seed.findAll();
    expect(seedRows.length).toBe(2);
  });
});
