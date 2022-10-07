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
    const mockUpdate = jest.fn();
    const apiToInitialise: ApiInitialisor = {
      update: mockUpdate,
      apiConsts: {
        name: "testApi",
        updateFrequency: 10000,
      },
    };
    let delay: number;

    beforeEach(async () => {
      dataSource = await DataSource.create({
        name: "testApi",
      });

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
      ({ delay } = await loadAndSyncApi(apiToInitialise));
    });

    afterEach(() => {
      jest.clearAllTimers();
    });

    test("it should call the API with the correct timeout if it has been called previously", async () => {
      expect(delay).toBeGreaterThanOrEqual(2 * 60 * 1000);
      expect(delay).toBeLessThan(2.1 * 60 * 1000);
    });

    test("it should call the API with the correct timeout if it hasn't been called before", async () => {
      await DataSource.create({
        name: "testApi2",
      });
      const apiToInitialise: ApiInitialisor = {
        update: jest.fn(),
        apiConsts: {
          name: "testApi2",
          updateFrequency: 10000,
        },
      };
      const { timeout, delay } = await loadAndSyncApi(apiToInitialise);
      expect(timeout).not.toBeNull();
      expect(delay).toBe(0);
    });

    test("it should call setInterval after setTimeout", async () => {
      jest.runOnlyPendingTimers();
      expect(setInterval).toHaveBeenCalled();
    });

    test("it should call setInterval with the correct ms value", () => {
      jest.runOnlyPendingTimers();
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        apiToInitialise.apiConsts.updateFrequency
      );
    });

    test("it should call update after setInterval is called", () => {
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
