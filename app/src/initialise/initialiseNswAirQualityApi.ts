import { Api } from "../db/models/Api";
import { Suburb } from "../db/models/Suburb";
import { Apis } from "../const/api";
import { ApiSuburb } from "../db/models/ApiSuburb";
import { getSites } from "../clients/nswAirQuality";

export const loadAndSync = async () => {
  const nswAirQualityApi = await Api.findOne({
    where: {
      name: Apis.NswAirQuality,
    },
  });
  if (!nswAirQualityApi) {
    const api = await Api.create({
      name: Apis.NswAirQuality,
    });
    const sites = await getSites();

    for (const site of sites) {
      const { name, region, siteId } = site;
      // there are many other readings across nsw, only include those close to sydney
      //https://www.dpie.nsw.gov.au/air-quality/air-quality-concentration-data-updated-hourly
      if (!region.includes("SYDNEY") || name.includes("SYDNEY")) continue;
      const [suburb] = await Suburb.findOrCreate({
        where: {
          name: name,
        },
      });
      await ApiSuburb.findOrCreate({
        where: {
          suburbId: suburb.id,
          apiId: api.id,
          apiSuburbMeta: { siteId },
        },
      });
    }
  }
};
