import {
  getMonthlyObservationsAQApi,
  getHourlyObservationsAQApi,
  AirQualityDataLive,
  getSites,
  getDailyObservations,
} from "../clients/nswAirQuality";
import { AirQualitySite } from "../db/models/AirQualitySite";
import { Api } from "../db/models/Api";
import { APIS } from "../const/api";
import { AirQualityReading } from "../db/models/AirQualityReading";
import { PollutantType } from "../db/models/AirQualityReading";

export const getMonthlyObservations = async (sites: number[]) => {
  const date = new Date();
  const startDate = `${date.getFullYear()}-01-01`;
  const endDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const airQualityData = getMonthlyObservationsAQApi(startDate, endDate, sites);

  return airQualityData;
};

export const getCurrentObservations = async (sites: number[]) => {
  const emissions: string[] = ["NO2"];
  const currentDate = new Date();
  const currentDateString = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;
  const tomorrowDateString = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate() + 1}`;
  const observations = await getHourlyObservationsAQApi(
    emissions,
    sites,
    currentDateString,
    tomorrowDateString
  );

  const observationsBySite: { [key: number]: AirQualityDataLive } = {};
  // get the most recent observation for each site that isn't null
  observations.map((observation) => {
    if (
      !observationsBySite[observation.siteId] ||
      !observationsBySite[observation.siteId].value
    ) {
      observationsBySite[observation.siteId] = observation;
    } else if (
      observationsBySite[observation.siteId].hour < observation.hour &&
      observation.value
    ) {
      observationsBySite[observation.siteId] = observation;
    }
  });
  return Object.values(observationsBySite);
};

export const updateSites = async () => {
  const api = await Api.findOne({
    where: {
      name: APIS.nswAirQualitySites.name,
    },
  });
  if (!api)
    throw new Error(`Could not find API ${APIS.nswAirQualitySites.name}`);
  const sites = await getSites();
  for (const site of sites) {
    const { name, region, siteId, lat, lng } = site;
    // there are many other readings across nsw, only include those close to sydney
    // https://www.dpie.nsw.gov.au/air-quality/air-quality-concentration-data-updated-hourly
    if (!region.includes("SYDNEY") || name.includes("SYDNEY")) continue;
    let aqSite = await AirQualitySite.findOne({
      where: {
        siteId,
      },
    });
    if (!aqSite) {
      aqSite = await AirQualitySite.create({
        siteId,
        lng,
        lat,
        name,
        region,
        apiId: api.id,
      });
    }
  }
};

export const updateDailyReadings = async (endDate: Date) => {
  const sites = (await AirQualitySite.findAll({})).map((site) => site.siteId);
  const startDate = new Date(new Date().setDate(endDate.getDate() - 30));

  const todayParsed = `${endDate.getFullYear()}-${
    endDate.getMonth() + 1
  }-${endDate.getDay()}`;
  const startDateParsed = `${startDate.getFullYear()}-${
    startDate.getMonth() + 1
  }-${startDate.getDay()}`;
  const observations = await getDailyObservations(
    [PollutantType.NO2],
    sites,
    startDateParsed,
    todayParsed
  );

  const dailyReadingsInDb = await AirQualityReading.findAll({
    where: {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  });
  const daiilyReadingsMapped: { [key: string]: AirQualityReading } = {};
  dailyReadingsInDb.forEach((dailyReading) => {
    const dateToString = `${dailyReading.date.getFullYear()}-${
      dailyReading.date.getMonth() + 1
    }-${dailyReading.date.getDate()}`;
    if (!daiilyReadingsMapped[dateToString]) {
      daiilyReadingsMapped[dateToString] = dailyReading;
    }
  });

  observations.forEach(async (observation) => {
    const existingReading = daiilyReadingsMapped[observation.date];
    if (!existingReading) {
      await AirQualityReading.create({
        date: new Date(observation.date),
        value: observation.value,
        frequency: observation.frequency,
        type: observation.type,
      });
    }
    if (!existingReading.value) {
      await existingReading.update({ value: observation.value });
    }
  });
};
