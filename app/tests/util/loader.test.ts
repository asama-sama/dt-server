/// <reference types="@types/jest" />;
import { Loader } from "../../src/util/loader";
import { logger } from "../../src/util/logger";

describe("loader", () => {
  describe("createLoadIndicator", () => {
    let loader: Loader;
    beforeEach(() => {
      loader = new Loader(100);
      for (let i = 0; i < 19; i++) {
        loader.tick();
      }
    });

    test("it should set the loader size correctly", () => {
      loader.size = 100;
    });

    test("it should create the load indicator", () => {
      expect(Object.keys(loader.loadIndicators).length).toBe(21);
    });

    test("it should set the correct keys for load indicators", () => {
      expect(Object.keys(loader.loadIndicators)).toEqual([
        "0",
        "5",
        "10",
        "15",
        "20",
        "25",
        "30",
        "35",
        "40",
        "45",
        "50",
        "55",
        "60",
        "65",
        "70",
        "75",
        "80",
        "85",
        "90",
        "95",
        "100",
      ]);
    });

    test("it should mark several load values", () => {
      expect(loader.loadIndicators[0]).toBe(true);
      expect(loader.loadIndicators[5]).toBe(true);
      expect(loader.loadIndicators[10]).toBe(true);
      expect(loader.loadIndicators[15]).toBe(true);
      expect(loader.loadIndicators[20]).toBe(false);
    });

    test("it should call logger the correct number of times", () => {
      expect(logger).toHaveBeenCalledTimes(4);
    });
  });
});
