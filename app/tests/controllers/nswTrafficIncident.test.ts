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
import { updateSuburbGeoJson } from "../../src/util/updateSuburbGeoJson";
import { DATASOURCES } from "../../src/const/datasource";

jest.mock("../../src/clients/nswTrafficIncidents", () => {
  return {
    __esModule: true,
    fetchIncidents: jest.fn(),
  };
});

jest.mock("../../src/util/updateSuburbGeoJson", () => {
  return {
    __esModule: true,
    updateSuburbGeoJson: jest.fn(),
  };
});

const fetchIncidentsMock = fetchIncidents as jest.MockedFunction<
  typeof fetchIncidents
>;
const updateSuburbGeoJsonMock = updateSuburbGeoJson as jest.MockedFunction<
  typeof updateSuburbGeoJson
>;

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
              end: new Date("2022-03-3").getTime(),
              lastUpdated: new Date().getTime(),
              mainCategory: "category 1",
              roads: [
                {
                  region: "sydney",
                  suburb: "suburb",
                },
              ],
            },
          },
        },
      },
    ],
  };

  fetchIncidentsMock.mockResolvedValue(response);

  beforeEach(async () => {
    await updateIncidents();
  });

  test("it should create suburbs", async () => {
    const suburbs = await Suburb.findAll();
    expect(suburbs.length).toBe(1);
  });

  test("it should create categories for each suburb", async () => {
    const categories = await TrafficIncidentCategory.findAll();
    expect(categories.length).toBe(1);
  });

  test("it should create traffic incidents populated with the correct values", async () => {
    const incidents = await TrafficIncident.findAll();
    const [suburb] = await Suburb.findAll();
    const [category] = await TrafficIncidentCategory.findAll();
    const dataSource = await DataSource.findOne({
      where: {
        name: DATASOURCES.trafficIncidents.name,
      },
    });
    expect(incidents.length).toBe(1);
    expect(incidents[0]).toMatchObject({
      id: 112,
      lat: 23.3,
      lng: -123.54,
      created: new Date("2022-03-01"),
      end: new Date("2022-03-3"),
      suburbId: suburb.id,
      trafficIncidentCategoryId: category.id,
      dataSourceId: dataSource?.id,
    });
  });

  test("it should not reinsert an incident with the same id", async () => {
    await updateIncidents();
    const incidents = await TrafficIncident.findAll();
    expect(incidents.length).toBe(1);
  });

  test("it should call updateSuburbGeoJson", () => {
    expect(updateSuburbGeoJsonMock).toHaveBeenCalled();
  });
});