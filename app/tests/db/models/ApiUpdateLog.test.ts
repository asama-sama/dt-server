import { Api } from "../../../src/db/models/Api";
import {
  ApiUpdateLog,
  UpdateStatus,
} from "../../../src/db/models/ApiUpdateLog";

describe("ApiUpdateLog", () => {
  let api: Api;
  beforeEach(async () => {
    api = await Api.create({
      name: "api1",
    });
  });

  test("it should update the log status to SUCCESS", async () => {
    const updateLog = await ApiUpdateLog.create({
      apiId: api.id,
      status: UpdateStatus.SUCCESS,
    });
    expect(updateLog.status).toBe(UpdateStatus.SUCCESS);
  });

  test("it should update the log status to FAIL", async () => {
    const updateLog = await ApiUpdateLog.create({
      apiId: api.id,
      status: UpdateStatus.FAIL,
    });
    expect(updateLog.status).toBe(UpdateStatus.FAIL);
  });

  test("it should throw an error if not updating with enum", async () => {
    expect(async () => {
      await ApiUpdateLog.create({
        apiId: api.id,
        status: "test",
      });
    }).rejects.toThrowError(
      "Validation error: status must be of type UpdateStatus: test"
    );
  });
});
