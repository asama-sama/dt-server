/// <reference types="@types/jest" />;
import { DataSource } from "../../src/db/models/DataSource";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../../src/db/models/DataSourceUpdateLog";
import { ApiInitialisor } from "../../src/initialise/apisToLoad";
import { loadAndSyncApi } from "../../src/initialise/init";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");
jest.spyOn(global, "setInterval");

describe("init", () => {
  describe("loadAndSyncApi", () => {
    let dataSource: DataSource;
    const mockUpdate = jest.fn(() => {
      return Promise.resolve();
    });
    const apiToInitialise: ApiInitialisor = {
      update: mockUpdate,
      apiConsts: {
        name: "testApi",
        updateFrequency: 10 * 60 * 1000, // 10 minutes
      },
    };
    let delay: number;
    let timeout: Promise<void>;

    beforeEach(async () => {
      dataSource = await DataSource.create({
        name: "testApi",
      });
      ({ delay, timeout } = await loadAndSyncApi(apiToInitialise));
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    test("it should call the API with the correct timeout if it has been called previously", async () => {
      let oneMinuteAgo = new Date();
      oneMinuteAgo = new Date(
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)
      );
      let twoMinutesAgo = new Date();
      twoMinutesAgo = new Date(
        twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2)
      );
      let threeMinutesAgo = new Date();
      threeMinutesAgo = new Date(
        threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3)
      );
      await DataSourceUpdateLog.create({
        dataSourceId: dataSource.id,
        status: UpdateStatus.SUCCESS,
        createdAt: threeMinutesAgo.getTime(),
      });
      await DataSourceUpdateLog.create({
        dataSourceId: dataSource.id,
        status: UpdateStatus.SUCCESS,
        createdAt: twoMinutesAgo.getTime(),
      });
      await DataSourceUpdateLog.create({
        dataSourceId: dataSource.id,
        status: UpdateStatus.FAIL,
        createdAt: oneMinuteAgo.getTime(),
      });
      ({ delay } = await loadAndSyncApi(apiToInitialise));
      const maxDelay =
        apiToInitialise.apiConsts.updateFrequency -
        (new Date().getTime() - twoMinutesAgo.getTime());
      expect(delay).toBeGreaterThanOrEqual(maxDelay - 1000);
      expect(delay).toBeLessThanOrEqual(maxDelay);
    });

    test("it should call the API with the correct timeout if it hasn't been called before", async () => {
      const { timeout, delay } = await loadAndSyncApi(apiToInitialise);
      expect(timeout).not.toBeNull();
      expect(delay).toBe(0);
    });

    test("it should call update when setTimeout is called", async () => {
      jest.runOnlyPendingTimers();
      await timeout;
      expect(mockUpdate).toHaveBeenCalled();
    });

    test("it should create a DataSourceUpdateLog when update is called", async () => {
      jest.runOnlyPendingTimers();
      await timeout;
      const logs = await DataSourceUpdateLog.findAll({});
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe(UpdateStatus.SUCCESS);
    });

    test("it should create a DataSourceUpdateLog with status failed if update fails", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("error updating"));
      jest.runOnlyPendingTimers();
      await timeout;
      const logs = await DataSourceUpdateLog.findAll();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe(UpdateStatus.FAIL);
      expect(logs[0].message).toBe("error updating");
    });

    test("it should call setInterval after setTimeout", async () => {
      jest.runOnlyPendingTimers();
      await timeout;
      expect(setInterval).toHaveBeenCalled();
    });

    test("it should call setInterval with the correct ms value", async () => {
      jest.runOnlyPendingTimers();
      await timeout;
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        apiToInitialise.apiConsts.updateFrequency
      );
    });

    test("it should call update after setInterval is called", async () => {
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      await timeout;
      await Promise.resolve();
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    test("it should create a success entry in DataSourceUpdateLog after update is run", async () => {
      jest.runOnlyPendingTimers();
      await timeout;
      const dataSourceUpdateLogs = await DataSourceUpdateLog.findAll();
      expect(dataSourceUpdateLogs[0].status).toBe("SUCCESS");
      jest.clearAllTimers();
    });

    test("it should create a fail entry in DataSourceUpdateLog after update is run and throw an error", async () => {
      mockUpdate.mockRejectedValueOnce("error");
      jest.runOnlyPendingTimers();
      await timeout;
      const dataSourceUpdateLogs = await DataSourceUpdateLog.findAll();
      expect(dataSourceUpdateLogs[0].status).toBe("FAIL");
      jest.clearAllTimers();
    });
  });
});
