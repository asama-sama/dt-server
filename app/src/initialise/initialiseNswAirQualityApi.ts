// DEPRECATE

import { Api } from "../db/models/Api";
import { APIS } from "../const/api";
import { Suburb } from "../db/models/Suburb";
import { getSites } from "../clients/nswAirQuality";

export const loadAndSync = async () => {
  const nswAirQualityReadingsApi = await Api.findOne({
    where: {
      name: APIS.nswAirQualityReadings.name,
    },
  });
  if (!nswAirQualityReadingsApi) {
    await Api.create({
      name: APIS.nswAirQualityReadings.name,
      uri: APIS.nswAirQualityReadings.uri,
      queryStringParams: APIS.nswAirQualityReadings.queryStringParams,
    });
  }
  const nswAirQualitySitesApi = await Api.findOne({
    where: {
      name: APIS.nswAirQualitySites.name,
    },
  });
  if (!nswAirQualitySitesApi) {
    await Api.create({
      where: {
        name: APIS.nswAirQualitySites.name,
        uri: APIS.nswAirQualitySites.uri,
        queryStringParams: APIS.nswAirQualitySites.queryStringParams,
      },
    });
  }
  // if (!nswAirQualityApi) {
  //   const api = await Api.create({
  //     name: APIS.nswAirQualityReadings,
  //   });
  // }
  // const sites = await getSites();

  // for (const site of sites) {
  //   const { name, region, siteId } = site;
  // there are many other readings across nsw, only include those close to sydney
  //https://www.dpie.nsw.gov.au/air-quality/air-quality-concentration-data-updated-hourly
  // if (!region.includes("SYDNEY") || name.includes("SYDNEY")) continue;
  // const [suburb] = await Suburb.findOrCreate({
  //   where: {
  //     name: name,
  //   },
  // });
  // await ApiSuburb.findOrCreate({
  //   where: {
  //     suburbId: suburb.id,
  //     apiId: api.id,
  //     apiSuburbMeta: { siteId },
  //   },
  // });
};
