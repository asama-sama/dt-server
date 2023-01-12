/// <reference types="@types/jest" />;
import { dateToString } from "../../src/util/date";

describe("date utils", () => {
  describe("dateToString", () => {
    it("it should format the date correctly", () => {
      const date = new Date("2010-10-03");
      const dateString = dateToString(date);
      expect(dateString).toBe("2010-10-03");
    });
  });
});
