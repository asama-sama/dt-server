import { getStations } from "../clients/bom";
import { getConnection } from "../db/connect";
import { BomStation } from "../db/models/BomStation";

export const updateStations = async () => {
  const stations = await getStations();

  const connection = getConnection();
  connection.transaction(async (trx) => {
    for (const station of stations) {
      await BomStation.findOrCreate({
        where: {
          stationId: station.id,
        },
        defaults: {
          stationId: station.id,
          name: station.name,
        },
        transaction: trx,
      });
    }
  });
};
