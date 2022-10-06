/// <reference types="@types/jest" />;
import { listToSqlStringList } from "../../src/util/sql";

describe("sql", () => {
  test("it should handle a normal list", () => {
    const sqlStrList = listToSqlStringList([1, 2, 3, 4]);
    expect(sqlStrList).toBe("('1','2','3','4')");
  });
  test("it should handle an empty list", () => {
    const sqlStrList = listToSqlStringList([]);
    expect(sqlStrList).toBe("('')");
  });
});
