import { fetchIncidents } from "../clients/nswTrafficIncidents";
import {
  DataSourceUpdateLog,
  UpdateStatus,
} from "../db/models/DataSourceUpdateLog";
import { DataSource } from "../db/models/DataSource";
import { DATASOURCES } from "../const/datasource";
import { getConnection } from "../db/connect";
import { Suburb } from "../db/models/Suburb";
import { TrafficIncidentCategory } from "../db/models/TrafficIncidentCategory";
import { TrafficIncident } from "../db/models/TrafficIncident";
import { updateSuburbGeoJson, transformSuburbNames } from "../util/suburbUtils";
import { getTrafficIncidentCategory } from "../util/trafficIncidents";

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
  try {
    const now = new Date();
    const results = await fetchIncidents(now, initialise);
    const connection = getConnection();

    const suburbsCache: { [key: string]: Suburb } = {};
    const categoryCache: { [key: string]: TrafficIncidentCategory } = {};
    await connection.transaction(async (trx) => {
      for (const trafficIncident of results.result) {
        const id = trafficIncident.Hazards.features.id;
        const [lat, lng] =
          trafficIncident.Hazards.features.geometry.coordinates;
        const suburbName = transformSuburbNames(
          trafficIncident.Hazards.features.properties.roads[0].suburb
        );
        const {
          created,
          mainCategory: subcategory,
          end,
        } = trafficIncident.Hazards.features.properties;

        let suburb = suburbsCache[suburbName];
        if (!suburb) {
          [suburb] = await Suburb.findOrCreate({
            where: { name: suburbName },
            transaction: trx,
          });
        }
        let trafficIncidentCategory = categoryCache[subcategory];
        if (!trafficIncidentCategory) {
          const category = getTrafficIncidentCategory(subcategory);
          [trafficIncidentCategory] =
            await TrafficIncidentCategory.findOrCreate({
              where: {
                subcategory,
              },
              defaults: {
                category,
                subcategory,
              },
              transaction: trx,
            });
        }
        const [incident] = await TrafficIncident.findOrCreate({
          where: {
            id,
          },
          defaults: {
            id,
            lat,
            lng,
            created: new Date(created),
            end: end ? new Date(end) : null,
            suburbId: suburb.id,
            trafficIncidentCategoryId: trafficIncidentCategory.id,
            dataSourceId: dataSource.id,
          },
          transaction: trx,
        });
        if (!incident.end && end) {
          incident.update({
            end: new Date(end),
          });
        }
      }
    });
    await updateSuburbGeoJson();
  } catch (e) {
    let message = "error";
    if (e instanceof Error) {
      message = e.message;
    }
    console.error(e);
    await DataSourceUpdateLog.create({
      dataSourceId: dataSource?.id,
      status: UpdateStatus.FAIL,
      message,
    });
    throw e;
  }
};
