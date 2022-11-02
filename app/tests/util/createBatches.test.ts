/// <reference types="@types/jest" />;
import { createBatches } from "../../src/util/createBatches";

describe("createBatches", () => {
  const items = Array.from({ length: 100 });

  test("it should create the correct sized batches with an even batch size", () => {
    const batches = createBatches(items, 25);
    expect(batches.length).toBe(4);
    for (const batch of batches) {
      expect(batch.length).toBe(25);
    }
  });

  test("it should create the correct sized batches with an uneven batch size", () => {
    const batches = createBatches(items, 30);
    expect(batches.length).toBe(4);
    expect(batches.map((batch) => batch.length)).toEqual([30, 30, 30, 10]);
  });
});
