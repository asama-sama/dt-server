/// <reference types="@types/jest" />;

import { Suburb } from "../../src/db/models/Suburb";
import { getByPosition, getSuburbsById } from "../../src/controllers/suburbs";

describe("suburbs", () => {
  describe("getSuburbsById", () => {
    let suburbs: Suburb[];
    beforeEach(async () => {
      suburbs = await Suburb.bulkCreate([
        {
          name: "s1",
        },
        {
          name: "s2",
        },
        {
          name: "s3",
        },
        {
          name: "s4",
        },
        {
          name: "s5",
        },
      ]);
    });

    test("it should return all suburbs for the given ids", async () => {
      const fetchedSuburbs = await getSuburbsById([
        suburbs[0].id,
        suburbs[2].id,
        suburbs[3].id,
      ]);
      expect(fetchedSuburbs).toMatchObject([
        expect.objectContaining({ name: "S1" }),
        expect.objectContaining({ name: "S3" }),
        expect.objectContaining({ name: "S4" }),
      ]);
    });
  });

  describe("getByPosition", () => {
    const suburbs: Suburb[] = [];
    beforeEach(async () => {
      const s1 = await Suburb.create({
        name: "melb cbd",
        boundary: {
          type: "Polygon",
          coordinates: [
            [
              [144.940559, -37.808542],
              [144.940803, -37.82378],
              [144.975475, -37.818765],
              [144.970938, -37.80684],
              [144.940559, -37.808542],
            ],
          ],
        },
      });
      const s2 = await Suburb.create({
        name: "Williamstown",
        boundary: {
          type: "Polygon",
          coordinates: [
            [
              [144.9009, -37.845617],
              [144.872219, -37.86094],
              [144.903326, -37.872881],
              [144.9009, -37.845617],
            ],
          ],
        },
      });
      suburbs.push(s1);
      suburbs.push(s2);
    });

    test("it should retrieve 1 suburb", async () => {
      const suburbs = await getByPosition(
        144.9628003087228,
        -37.81459344382986,
        1000
      );
      expect(suburbs.length).toBe(1);
    });

    test("it should retrieve 2 suburbs", async () => {
      const suburbs = await getByPosition(
        144.9628003087228,
        -37.81459344382986,
        7000
      );
      expect(suburbs.length).toBe(2);
    });
  });
});
