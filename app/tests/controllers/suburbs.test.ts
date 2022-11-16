/// <reference types="@types/jest" />;

import { Suburb } from "../../src/db/models/Suburb";
import { getSuburbsById } from "../../src/controllers/suburbs";

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
});
