import { DataSource } from "../../../src/db/models/DataSource";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../../../src/db/models/DataSourceUpdateLog";

describe("ApiUpdateLog", () => {
  let api: DataSource;
  beforeEach(async () => {
    api = await DataSource.create({
      name: "api1",
    });
  });

  test("it should update the log status to SUCCESS", async () => {
    const updateLog = await DataSourceUpdateLog.create({
      apiId: api.id,
      status: UpdateStatus.SUCCESS,
    });
    expect(updateLog.status).toBe(UpdateStatus.SUCCESS);
  });

  test("it should update the log status to FAIL", async () => {
    const updateLog = await DataSourceUpdateLog.create({
      apiId: api.id,
      status: UpdateStatus.FAIL,
    });
    expect(updateLog.status).toBe(UpdateStatus.FAIL);
  });

  test("it should throw an error if not updating with enum", async () => {
    expect(async () => {
      await DataSourceUpdateLog.create({
        apiId: api.id,
        status: "test",
      });
    }).rejects.toThrowError(
      "Validation error: status must be of type UpdateStatus: test"
    );
  });
});
