/// <reference types="@types/jest" />;
import { getValidMonthsYears } from "../../src/util/getValidMonthsYears";

describe("getValidMonthsYears", () => {
  test("it should return correctly for year:2022, month: 6, numMonthsToSearch:3", () => {
    const { monthsToSearch, yearsToSearch } = getValidMonthsYears(2022, 6, 3);
    expect(monthsToSearch).toEqual([6, 5, 4]);
    expect(yearsToSearch).toEqual([2022]);
  });

  test("it should return correctly for year:2020, month: 3, numMonthsToSearch:6", () => {
    const { monthsToSearch, yearsToSearch } = getValidMonthsYears(2020, 3, 6);
    expect(monthsToSearch).toEqual([3, 2, 1, 12, 11, 10]);
    expect(yearsToSearch).toEqual([2020, 2019]);
  });

  test("it should return correctly for year:2010, month: 5, numMonthsToSearch:24", () => {
    const { monthsToSearch, yearsToSearch } = getValidMonthsYears(2010, 5, 24);
    expect(monthsToSearch).toEqual([5, 4, 3, 2, 1, 12, 11, 10, 9, 8, 7, 6]);
    expect(yearsToSearch).toEqual([2010, 2009, 2008]);
  });
});
