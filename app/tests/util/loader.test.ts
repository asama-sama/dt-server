/// <reference types="@types/jest" />;
import {
  createLoadIndicator,
  LoadIndicators,
  markLoaded,
} from "../../src/util/loader";

describe("loader", () => {
  describe("createLoadIndicator", () => {
    let indicators: LoadIndicators;
    beforeEach(() => {
      indicators = createLoadIndicator();
    });

    test("it should create the load indicator", () => {
      expect(Object.keys(indicators).length).toBe(21);
    });

    test("it should mark the correct loaded value", () => {
      markLoaded(indicators, 0);
      expect(indicators[0]).toBe(true);
      expect(indicators[5]).toBe(false);
    });

    test("it should mark several load values", () => {
      markLoaded(indicators, 19);
      expect(indicators[0]).toBe(true);
      expect(indicators[5]).toBe(true);
      expect(indicators[10]).toBe(true);
      expect(indicators[15]).toBe(true);
      expect(indicators[20]).toBe(false);
    });
  });
});
