import { fetchIncidents } from "../clients/nswTrafficIncidents";
import { createBatches } from "../util/createBatches";
import { DataSource } from "../db/models/DataSource";
import { DATASOURCES } from "../const/datasource";
import { getConnection } from "../db/connect";
import { Suburb } from "../db/models/Suburb";
import { TrafficIncidentCategory } from "../db/models/TrafficIncidentCategory";
import { TrafficIncident } from "../db/models/TrafficIncident";
import { updateSuburbGeoJson, parseSuburbNames } from "../util/suburbUtils";
import { getTrafficIncidentCategory } from "../util/trafficIncidents";
import { Loader } from "../util/loader";
import { TrafficIncidentSuburb } from "../db/models/TrafficIncidentSuburb";
import { AirQualitySite } from "../db/models/AirQualitySite";

type GetIncidents = (initialise?: boolean) => Promise<void>;

export const updateIncidents: GetIncidents = async (initialise = false) => {
  const dataSource = await DataSource.findOne({
    where: {
      name: DATASOURCES.trafficIncidents.name,
    },
  });
  if (!dataSource)
    throw new Error(
      `No datasource for ${DATASOURCES.trafficIncidents.name} found`
    );
  const now = new Date();
  const results = await fetchIncidents(now, initialise);
  const connection = getConnection();
  const suburbsCache: { [key: string]: Suburb } = {};
  const categoryCache: { [key: string]: TrafficIncidentCategory } = {};
  const loader = new Loader(results.result.length, "Traffic Incidents");
  const incidentResponseBatches = createBatches(results.result, 200);
  for (const incidentResponseBatch of incidentResponseBatches) {
    await connection.transaction(async (trx) => {
      for (const trafficIncident of incidentResponseBatch) {
        loader.tick();
        const id = trafficIncident.Hazards.features.id;
        const [lng, lat] =
          trafficIncident.Hazards.features.geometry.coordinates;

        const suburbs: Suburb[] = [];
        const suburbNames = parseSuburbNames(
          trafficIncident.Hazards.features.properties.roads[0].suburb
        );
        for (let i = 0; i < suburbNames.length; i++) {
          const suburbName = suburbNames[i];
          let suburb = suburbsCache[suburbName];
          if (!suburb) {
            [suburb] = await Suburb.findOrCreate({
              where: { name: suburbName },
              transaction: trx,
            });
          }
          suburbs.push(suburb);
        }

        const { mainCategory: subcategory } =
          trafficIncident.Hazards.features.properties;
        let trafficIncidentCategory = categoryCache[subcategory];
        if (!trafficIncidentCategory) {
          const category = getTrafficIncidentCategory(subcategory);
          [trafficIncidentCategory] =
            await TrafficIncidentCategory.findOrCreate({
              where: {
                subcategory: subcategory.toUpperCase(),
              },
              defaults: {
                category,
                subcategory,
              },
              transaction: trx,
            });
        }
        const { end, created } = trafficIncident.Hazards.features.properties;
        const [incident] = await TrafficIncident.findOrCreate({
          where: {
            id,
          },
          defaults: {
            id,
            position: {
              type: "Point",
              coordinates: [lng, lat],
            },
            created: new Date(created),
            end: end ? new Date(end) : null,
            trafficIncidentCategoryId: trafficIncidentCategory.id,
            dataSourceId: dataSource.id,
          },
          transaction: trx,
        });
        if (!incident.end && end) {
          incident.update(
            {
              end: new Date(end),
            },
            { transaction: trx }
          );
        }
        for (let i = 0; i < suburbs.length; i++) {
          const suburb = suburbs[i];
          await TrafficIncidentSuburb.findOrCreate({
            where: {
              trafficIncidentId: incident.id,
              suburbId: suburb.id,
            },
            transaction: trx,
          });
        }
      }
    });
  }
  await updateSuburbGeoJson();
};

type TrafficIncidentsByCategory = {
  [category: string]: number;
};

type GetTrafficIncidentsForAirQualityReadingSiteSignature = (
  airQualitySiteId: number,
  radius: number
) => Promise<TrafficIncidentsByCategory>;

/* Returns the number of traffic incidents X meters from an air
 * quality reading site */
// TODO: Complete this method
export const getTrafficIncidentsForAirQualityReadingSite: GetTrafficIncidentsForAirQualityReadingSiteSignature =
  async (airQualitySiteId, radius) => {
    const airQualitySite = await AirQualitySite.findOne({
      where: {
        id: airQualitySiteId,
      },
    });
    console.log("p", airQualitySite?.position);
    return {};
  };
