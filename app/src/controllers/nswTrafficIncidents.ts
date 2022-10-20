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
import { updateSuburbGeoJson } from "../util/updateSuburbGeoJson";

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
    await connection.transaction(async (trx) => {
      for (const trafficIncident of results.result) {
        const id = trafficIncident.Hazards.features.id;
        const [lat, lng] =
          trafficIncident.Hazards.features.geometry.coordinates;
        const suburbName =
          trafficIncident.Hazards.features.properties.roads[0].suburb;
        const { created, mainCategory, end } =
          trafficIncident.Hazards.features.properties;

        const [suburb] = await Suburb.findOrCreate({
          where: { name: suburbName.toUpperCase() },
          transaction: trx,
        });

        const [category] = await TrafficIncidentCategory.findOrCreate({
          where: {
            name: mainCategory,
          },
          transaction: trx,
        });
        await TrafficIncident.create(
          {
            id,
            lat,
            lng,
            created: new Date(created),
            end: end ? new Date(end) : null,
            suburbId: suburb.id,
            trafficIncidentCategoryId: category.id,
            dataSourceId: dataSource.id,
          },
          {
            transaction: trx,
          }
        );
      }
    });
    await updateSuburbGeoJson();
  } catch (e) {
    let message = "error";
    if (e instanceof Error) {
      message = e.message;
    }
    await DataSourceUpdateLog.create({
      dataSourceId: dataSource?.id,
      status: UpdateStatus.FAIL,
      message,
    });
  }
};
