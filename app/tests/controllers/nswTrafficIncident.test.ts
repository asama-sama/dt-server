/// <reference types="@types/jest" />;
import { updateIncidents } from "../../src/controllers/nswTrafficIncidents";
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
              coordinates: [23.3, -123.54],
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
