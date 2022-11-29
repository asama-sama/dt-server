/// <reference types="@types/jest" />;
import {
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
import { AirQualitySite } from "../../src/db/models/AirQualitySite";
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
      fetchIncidentsMock.mockResolvedValueOnce(response);
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
      fetchIncidentsMock.mockResolvedValue(newResponse);
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
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: new Date(),
        dataSourceId: dataSource.id,
      });

      const incidents5km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        5000
      );
      expect(incidents5km).toMatchObject({});

      const date = dateToString(new Date());

      const incidents10km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        10000
      );
      expect(incidents10km).toMatchObject({
        [date]: { CAT1: 1 },
      });
    });

    test("it should sum incidents in the same category", async () => {
      const dataSource = await DataSource.create({ name: "ds" });
      const trafficIncidentCategory = await TrafficIncidentCategory.create({
        category: "cat1",
        subcategory: "sub1",
      });
      await TrafficIncident.create({
        id: 1,
        position: {
          type: "Point",
          coordinates: coordsFootscray,
        },
        trafficIncidentCategoryId: trafficIncidentCategory.id,
        created: new Date(),
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

      const date = dateToString(new Date());

      const incidents15km = await getTrafficIncidentsNearPosition(
        coordsMelbourne,
        15000
      );
      expect(incidents15km).toMatchObject({
        [date]: { CAT1: 2 },
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
        10000
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
        10000
      );

      const dateString = dateToString(date);
      expect(incidents10km).toMatchObject({
        [dateString]: {
          CAT1: 1,
          CAT2: 1,
        },
      });
    });
  });
});
