/// <reference types="@types/jest" />;
import axios from "axios";
import {
  updateSuburbGeoJson,
  parseSuburbNames,
} from "../../src/util/suburbUtils";
import { Suburb } from "../../src/db/models/Suburb";
import { Op } from "sequelize";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("updateSuburbGeoJson", () => {
  test("it should set boundary in suburb properly", async () => {
    await Suburb.create({
      name: "s0",
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          geojson: {
            type: "Polygon",
            coordinates: [
              [
                [1, 1],
                [2, 2],
              ],
            ],
          },
          extratags: {
            place: "suburb",
          },
        },
      ],
    });
    await updateSuburbGeoJson();
    const suburb = await Suburb.findOne({
      where: {
        name: "S0",
      },
    });
    expect(suburb?.boundary).toMatchObject({
      type: "Polygon",
      coordinates: [
        [
          [1, 1],
          [2, 2],
        ],
      ],
    });
  });

  test("it should not set boundary for suburbs if a polygon was not received", async () => {
    await Suburb.create({ name: "s1" });
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          geojson: {
            type: "Point",
            coordinates: [1, 1],
          },
        },
      ],
    });
    await updateSuburbGeoJson();
    const suburb = await Suburb.findOne({
      where: {
        name: "S1",
      },
    });
    expect(suburb?.boundary).toBeNull();
    expect(suburb?.fetchFailed).toBe(true);
  });

  test("it should only fetch data for suburbs that don't have geojson set", async () => {
    await Suburb.create({
      name: "s2",
      boundary: {
        type: "Polygon",
        coordinates: [
          [
            [1, 1],
            [2, 2],
          ],
        ],
      },
    });

    await updateSuburbGeoJson();
    await Suburb.findOne({
      where: {
        name: "S2",
      },
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test("it should handle empty responses", async () => {
    await Suburb.create({
      name: "s3",
    });
    mockedAxios.get.mockResolvedValue({
      data: [],
    });
    await updateSuburbGeoJson();
    const s3 = await Suburb.findOne({
      where: {
        name: "S3",
      },
    });
    expect(s3?.boundary).toBeNull();
  });

  test("it should set geojson for multiple suburbs", async () => {
    await Suburb.bulkCreate([
      {
        name: "s0",
      },
      {
        name: "s1",
      },
    ]);
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          geojson: {
            type: "Polygon",
            coordinates: [
              [
                [1, 1],
                [2, 2],
              ],
            ],
          },
          extratags: {
            place: "suburb",
          },
        },
      ],
    });
    await updateSuburbGeoJson();
    const suburbsCount = await Suburb.findAndCountAll({
      where: {
        boundary: {
          [Op.ne]: null,
        },
      },
    });
    expect(suburbsCount.count).toBe(2);
  });

  test("it should set position in suburb properly", async () => {
    const s0 = await Suburb.create({
      name: "s0",
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          geojson: {
            type: "Polygon",
            coordinates: [
              [
                [1, 1],
                [2, 2],
              ],
            ],
          },
          extratags: {
            place: "suburb",
          },
          lat: 1,
          lon: 10,
        },
      ],
    });
    await updateSuburbGeoJson();
    await s0.reload();
    expect(s0.position).toMatchObject({
      type: "Point",
      coordinates: [10, 1],
    });
  });
});

describe("parseSuburbNames", () => {
  test('it parses "suburb" correctly', () => {
    const suburbs = parseSuburbNames("suburb");
    expect(suburbs).toMatchObject(["SUBURB"]);
  });

  test('it parses "suburb1 + suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1 + suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1+ suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1+ suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1 +suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1 +suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1+suburb2" correctly', () => {
    const suburbs = parseSuburbNames("suburb1+suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it parses "suburb1 to suburb2 correctly', () => {
    const suburbs = parseSuburbNames("suburb1 to suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it does not split "subtoburb', () => {
    const suburbs = parseSuburbNames("subtoburb");
    expect(suburbs).toMatchObject(["SUBTOBURB"]);
  });

  test('it splits "suburb1", "suburb2"', () => {
    const suburbs = parseSuburbNames("suburb1, suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it splits "suburb1- suburb2"', () => {
    const suburbs = parseSuburbNames("suburb1- suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it splits "suburb1 and suburb2"', () => {
    const suburbs = parseSuburbNames("suburb1 and suburb2");
    expect(suburbs).toMatchObject(["SUBURB1", "SUBURB2"]);
  });

  test('it does not split "suburb1andsuburb2"', () => {
    const suburbs = parseSuburbNames("suburb1andsuburb2");
    expect(suburbs).toMatchObject(["SUBURB1ANDSUBURB2"]);
  });
});
