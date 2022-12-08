/// <reference types="@types/jest" />;
import {
  getTrafficIncidentsForSuburbs,
  getTrafficIncidentsNearPosition,
  updateIncidents,
} from "../../src/controllers/nswTrafficIncidents";
import {
  fetchIncidents,
  FetchIncidentsApiResponse,
} from "../../src/clients/nswTrafficIncidents";
import { Suburb } from "../../src/db/models/Suburb";
import { TrafficIncidentCategory } from "../../src/db/models/TrafficIncidentCategory";
import { TrafficIncident } from "../../src/db/models/TrafficIncident";
import { DataSource } from "../../src/db/models/DataSource";
import * as suburbUtilsModule from "../../src/util/suburbUtils";
import { DATASOURCES } from "../../src/const/datasource";
import { TrafficIncidentSuburb } from "../../src/db/models/TrafficIncidentSuburb";
import { dateToString } from "../../src/util/date";

jest.mock("../../src/clients/nswTrafficIncidents", () => {
  return {
    __esModule: true,
    fetchIncidents: jest.fn(),
  };
});

const fetchIncidentsMock = fetchIncidents as jest.MockedFunction<
  typeof fetchIncidents
>;

const updateSuburbGeoJsonSpy = jest.spyOn(
  suburbUtilsModule,
  "updateSuburbGeoJson"
);
updateSuburbGeoJsonSpy.mockImplementation(jest.fn());

const parseSuburbNamesSpy = jest.spyOn(suburbUtilsModule, "parseSuburbNames");

describe("nswTrafficIncident", () => {
  describe("updateIncidents", () => {
    const response: FetchIncidentsApiResponse = {
      count: 2,
      result: [
        {
          Hazards: {
            id: "hazard1",
            features: {
              type: "type",
              id: 112,
              geometry: {
                type: "POINT",
                coordinates: [-123.54, 23.3],
              },
              properties: {
                created: new Date("2022-03-01").getTime(),
                lastUpdated: new Date().getTime(),
                mainCategory: "new roadworks",
                roads: [
                  {
                    region: "sydney",
                    suburb: "suburb to burb",
                  },
                ],
              },
            },
          },
        },
      ],
    };

    beforeEach(async () => {
      fetchIncidentsMock.mockResolvedValueOnce(response.result);
      await updateIncidents();
    });

    test("it should create an incident", async () => {
      const numTrafficIncidents = await TrafficIncident.findAndCountAll();
      expect(numTrafficIncidents.count).toBe(1);
    });

    test("it should create suburbs", async () => {
      const numSuburbs = await Suburb.findAndCountAll();
      expect(numSuburbs.count).toBe(2);
    });

    test("it should create a mapping between incident and suburb", async () => {
      const numTrafficIncidentSuburbs =
        await TrafficIncidentSuburb.findAndCountAll();
      expect(numTrafficIncidentSuburbs.count).toBe(2);
    });

    test("it should create categories for each incident", async () => {
      const categories = await TrafficIncidentCategory.findAll();
      expect(categories.length).toBe(1);
      expect(categories[0].category).toBe("ROADWORKS");
      expect(categories[0].subcategory).toBe("NEW ROADWORKS");
    });

    test("it should create traffic incidents populated with the correct values", async () => {
      const incidents = await TrafficIncident.findAll();
      const [category] = await TrafficIncidentCategory.findAll();
      const dataSource = await DataSource.findOne({
        where: {
          name: DATASOURCES.trafficIncidents.name,
        },
      });
      expect(incidents.length).toBe(1);
      expect(incidents[0]).toMatchObject({
        id: 112,
        position: {
          type: "Point",
          coordinates: [-123.54, 23.3],
        },
        created: new Date("2022-03-01"),
        trafficIncidentCategoryId: category.id,
        dataSourceId: dataSource?.id,
      });
    });

    test("it should not reinsert an incident with the same id", async () => {
      const incidents = await TrafficIncident.findAll();
      expect(incidents.length).toBe(1);
    });

    test("it should not create the same TrafficIncidentCategory twice", async () => {
      const categories = await TrafficIncidentCategory.findAll();
      expect(categories.length).toBe(1);
    });

    test("it should call updateSuburbGeoJson", () => {
      expect(updateSuburbGeoJsonSpy).toHaveBeenCalled();
    });

    test("it should call parseSuburbNames", () => {
      expect(parseSuburbNamesSpy).toHaveBeenCalled();
    });

    test('it should update the "end" value of an existing incident if it exists', async () => {
      const newResponse = { ...response };
      newResponse.result[0].Hazards.features.properties.end =
        new Date().getTime();
      fetchIncidentsMock.mockResolvedValue(newResponse.result);
      await updateIncidents();
      const incident = await TrafficIncident.findOne({
        where: {
          id: 112,
        },
      });
      expect(incident?.end).not.toBe(null);
    });
  });

  describe("getTrafficIncidentsNearPosition", () => {
    const coordsMelbourne = { lng: 144.961294, lat: -37.817433 }; // melbourne cbd
    const coordsFootscray = [144.891208, -37.79981]; // footscray (about 6km)
    const coordsSunshine = [144.833064, -37.788224]; // sunshine (about 11km)

    test("it should get the correct number of incidents within a radius of a site", async () => {
      const dataSource = await DataSource.create({ name: "ds" });
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const date = new Date();
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date,
        dataSourceId: dataSource.id,
      });

      const incidents5km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        5000,
        date
      );
      expect(incidents5km).toMatchObject({});

      const dateString = dateToString(date);

      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000,
        date
      );
      expect(incidents10km).toMatchObject({
        [dateString]: { CAT1: 1 },
      });
    });

    test("it should sum incidents in the same category", async () => {
      const dataSource = await DataSource.create({ name: "ds" });
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const date = new Date();
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date,
        dataSourceId: dataSource.id,
      });

      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: coordsSunshine,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: new Date(),
        dataSourceId: dataSource.id,
      });

      const incidents15km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        15000,
        date
      );
      const dateString = dateToString(new Date());
      expect(incidents15km).toMatchObject({
        [dateString]: { CAT1: 2 },
      });
    });

    test("it should separate incidents into different dates", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const date1 = new Date();
      const date2 = new Date();
      date2.setDate(date2.getDate() - 1);

      const dataSource = await DataSource.create({ name: "ds" });

      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date1,
        dataSourceId: dataSource.id,
      });

      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date2,
        dataSourceId: dataSource.id,
      });

      const date1String = dateToString(date1);
      const date2String = dateToString(date2);

      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000,
        date2
      );

      expect(incidents10km).toMatchObject({
        [date1String]: {
          CAT1: 1,
        },
        [date2String]: {
          CAT1: 1,
        },
      });
    });

    test("it should separate incidents by category", async () => {
      const trafficIncidentCategory1 = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const trafficIncidentCategory2 = await TrafficIncidentCategory.create({
        category: "cat2",
        subcategory: "sub2",
      });
      const dataSource = await DataSource.create({ name: "ds1" });

      const date = new Date();

      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory1.id,
        created: date,
        dataSourceId: dataSource.id,
      });

      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory2.id,
        created: date,
        dataSourceId: dataSource.id,
      });

      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000,
        date
      );

      const dateString = dateToString(date);
      expect(incidents10km).toMatchObject({
        [dateString]: {
          CAT1: 1,
          CAT2: 1,
        },
      });
    });

    test("it should only retrieve incidents after the start date", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const dataSource = await DataSource.create({ name: "ds1" });

      const date1 = new Date();
      const date2 = new Date();
      date2.setDate(date2.getDate() - 5);

      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date1,
        dataSourceId: dataSource.id,
      });
      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date2,
        dataSourceId: dataSource.id,
      });
      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000,
        date1
      );
      const dateString = dateToString(date1);
      expect(incidents10km).toMatchObject({
        [dateString]: {
          CAT1: 1,
        },
      });
    });

    test("it should only retrieve incidents before the end date", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const trafficIncidentCategory2 = await TrafficIncidentCategory.create({
        category: "cat2",
        subcategory: "sub2",
      });
      const dataSource = await DataSource.create({ name: "ds1" });

      const date1 = new Date();
      const date2 = new Date();
      date2.setDate(date2.getDate() - 5);

      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: date1,
        dataSourceId: dataSource.id,
      });
      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory2.id,
        created: date2,
        dataSourceId: dataSource.id,
      });
      const endDateToSearch = new Date();
      endDateToSearch.setDate(date1.getDate() - 2);
      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000,
        date2,
        endDateToSearch
      );
      const dateString = dateToString(date2);
      expect(incidents10km).toMatchObject({
        [dateString]: {
          CAT2: 1,
        },
      });
    });
  });

  describe("getTrafficIncidentsForSuburbs", () => {
    const suburbs: Suburb[] = [];
    let dataSource: DataSource;
    beforeEach(async () => {
      dataSource = await DataSource.create({
        name: "ds1",
      });

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
      suburbs.push(s1);
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
      suburbs.push(s2);
    });

    test("it should correctly get an incident for a given suburb", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const res = await getTrafficIncidentsForSuburbs([suburbs[0].id], date);
      expect(res).toMatchObject({
        [dateToString(new Date())]: {
          CAT1: 1,
        },
      });
    });

    test("it should not get an incident from outside a suburb", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const res = await getTrafficIncidentsForSuburbs([suburbs[1].id], date);
      expect(Object.keys(res).length).toBe(0);
    });

    test("it sum incidents across suburbs", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: [144.898263, -37.864103],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const res = await getTrafficIncidentsForSuburbs(
        [suburbs[1].id, suburbs[0].id],
        date
      );
      expect(res).toMatchObject({
        [dateToString(new Date())]: {
          CAT1: 2,
        },
      });
    });

    test("it places incidents into separate categories", async () => {
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      const trafficIncidentCategory2 = await TrafficIncidentCategory.create({
        category: "cat2",
        subcategory: "sub2",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: new Date(),
        trafficIncidentCategoryId: trafficIncidentCategory2.id,
        dataSourceId: dataSource.id,
      });
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const res = await getTrafficIncidentsForSuburbs([suburbs[0].id], date);
      expect(res).toMatchObject({
        [dateToString(new Date())]: {
          CAT1: 1,
          CAT2: 1,
        },
      });
    });

    test("it separates incidents into their relevant date", async () => {
      const d1 = new Date();
      const d2 = new Date();
      d2.setDate(d2.getDate() - 1);
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: d1,
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      await TrafficIncident.create({
        id: 2,
        position: {
          type: "Point",
          coordinates: [144.962686, -37.815751],
        },
        created: d2,
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        dataSourceId: dataSource.id,
      });
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const res = await getTrafficIncidentsForSuburbs([suburbs[0].id], date);
      expect(res).toMatchObject({
        [dateToString(d1)]: {
          CAT1: 1,
        },
        [dateToString(d2)]: {
          CAT1: 1,
        },
      });
    });
  });
});
