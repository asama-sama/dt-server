/// <reference types="@types/jest" />;
import { bulkSearch } from "../../src/clients/nominatim";
import axios from "axios";

describe("nominatim", () => {
  test("it should throttle requests", async () => {
    process.env.NOMINATIM_API_TIMEOUT = "500";

    const queries = ["q1", "q2"];
    const startTime = Date.now();
    await bulkSearch(queries);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    expect(endTime - startTime).toBeLessThanOrEqual(1500);

    process.env.NOMINATIM_API_TIMEOUT = "0";
  });

  test("it should hit the api the correct number of times", async () => {
    const queries = ["q1", "q2", "q3"];
    await bulkSearch(queries);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});
