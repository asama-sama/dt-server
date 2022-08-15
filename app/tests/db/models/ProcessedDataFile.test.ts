import { ProcessedDataFile } from "../../../src/db/models/ProcessedDataFile";

describe("ProcessedDataFile", () => {
  test("", async () => {
    const category = await ProcessedDataFile.create({
      name: "file",
    });
    expect(category).toMatchObject({
      name: "file",
    });
  });
});
