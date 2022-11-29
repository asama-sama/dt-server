import {
  getMonthlyObservationsAQApi,
  getHourlyObservationsAQApi,
  AirQualityDataLive,
  getSites,
  getObservations,
} from "../clients/nswAirQuality";
import { AirQualitySite } from "../db/models/AirQualitySite";
import { DataSource } from "../db/models/DataSource";
import { AirQualityReading } from "../db/models/AirQualityReading";
import { Op } from "sequelize";
import { UpdateFrequency, Frequency } from "../db/models/UpdateFrequency";
import { AirQualityUpdateParams, DATASOURCES } from "../const/datasource";
import { Suburb } from "../db/models/Suburb";
import { updateSuburbGeoJson } from "../util/suburbUtils";
import { logger, LogLevels } from "../util/logger";
import { Loader } from "../util/loader";
import { JobInitialisorOptions } from "../initialise/jobs";
import { dateToString } from "../util/date";
import { getConnection } from "../db/connect";
import { DatewiseCategorySums } from "../customTypes/calculated";

const DAYS_TO_SEARCH = 7;
const MONTHS_TO_SEARCH = 36;

type AirQualityApiFrequenciesToUpdateFrequencyMap = {
  [key: string]: Frequency;
};

const airQualityApiFrequenciesToUpdateFrequencyMap: AirQualityApiFrequenciesToUpdateFrequencyMap =
  {
    "24h average derived from 1h average": Frequency.DAILY,
    "Hourly average": Frequency.HOURLY,
  };

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
  const sites = await getSites();
  const dataSource = await DataSource.findOne({
    where: { name: DATASOURCES.nswAirQualitySites.name },
  });

  const suburbMap: { [key: string]: Suburb } = {}; // cache loaded suburbs

  for (const site of sites) {
    const { name: _suburbName, region: _region, siteId, lat, lng } = site;

    if (!lat || !lng) continue;

    const region = _region.toUpperCase();
    const suburbName = _suburbName.toUpperCase();
    // there are many other readings across nsw, only include those close to sydney
    // https://www.dpie.nsw.gov.au/air-quality/air-quality-concentration-data-updated-hourly
    if (!region.includes("SYDNEY") && !suburbName.includes("SYDNEY")) continue;

    let suburb: Suburb | null = suburbMap[suburbName];
    if (!suburb) {
      suburb = await Suburb.findOne({
        where: { name: suburbName },
      });
      if (!suburb) {
        suburb = await Suburb.create({
          name: suburbName,
        });
      }
    }

    await AirQualitySite.findOrCreate({
      where: {
        siteId,
      },
      defaults: {
        siteId,
        position: {
          type: "Point",
          coordinates: [lng, lat],
        },
        region,
        dataSourceId: dataSource?.id,
        suburbId: suburb.id,
      },
    });
  }
  await updateSuburbGeoJson();
};

export const updateAirQualityReadings = async (
  params: AirQualityUpdateParams,
  airQualitySitesMap: { [key: string]: AirQualitySite },
  startDate: Date,
  endDate: Date
) => {
  logger(`get airquality readings for ${params.parameters[0]}`);
  const endDateParsed = dateToString(endDate);
  const startDateParsed = dateToString(startDate);

  const observations = await getObservations(
    params,
    Object.keys(airQualitySitesMap).map(Number),
    startDateParsed,
    endDateParsed
  );
  const readingsForType = await AirQualityReading.findAll({
    where: {
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      type: params.parameters[0],
    },
  });
  const readingsMapped: {
    [key: string]: { [key: number]: AirQualityReading };
  } = {};
  readingsForType.forEach((readingForType) => {
    const year = readingForType.date.getFullYear();
    const month = String(readingForType.date.getMonth() + 1).padStart(2, "0");
    const day = String(readingForType.date.getDate()).padStart(2, "0");
    const { hour } = readingForType;
    const dateToString = `${year}-${month}-${day} ${hour}`;

    if (!readingsMapped[dateToString]) {
      readingsMapped[dateToString] = {};
    }
    readingsMapped[dateToString][readingForType.airQualitySiteId] =
      readingForType;
  });

  const freq =
    airQualityApiFrequenciesToUpdateFrequencyMap[params.frequency[0]];
  const updateFrequency = await UpdateFrequency.findOne({
    where: { frequency: freq },
  });
  const dataSource = await DataSource.findOne({
    where: {
      name: DATASOURCES.nswAirQualityReadings.name,
    },
  });

  if (!updateFrequency || !updateFrequency.id)
    throw new Error(`updateFrequency not found: ${Frequency.DAILY}`);
  const loader = new Loader(
    observations.length,
    `Air Quality - ${params.parameters[0]}`
  );
  for (const observation of observations) {
    const airQualitySiteId = airQualitySitesMap[observation.siteId].id;
    const lookupDate = `${observation.date} ${observation.hour}`;
    const existingReading =
      readingsMapped[lookupDate] &&
      readingsMapped[lookupDate][airQualitySiteId];
    if (!existingReading) {
      const date = new Date(observation.date);
      date.setHours(observation.hour);
      await AirQualityReading.create({
        date,
        value: observation.value,
        type: observation.type,
        dataSourceId: dataSource?.id,
        airQualitySiteId: airQualitySiteId,
        updateFrequencyId: updateFrequency.id,
        hour: observation.hour,
      });
    }
    if (existingReading && existingReading.value === null) {
      await existingReading.update({ value: observation.value });
    }
    loader.tick();
  }
};

export const callUpdateAirQualityReadings = async (
  options: JobInitialisorOptions,
  endDate: Date
) => {
  const airQualitySites = await AirQualitySite.findAll({});
  const airQualitySitesMap: { [key: string]: AirQualitySite } = {};
  airQualitySites.forEach((airQualitySite) => {
    airQualitySitesMap[airQualitySite.siteId] = airQualitySite;
  });

  const startDate = new Date(endDate.getTime());
  if (options.initialise) {
    startDate.setMonth(endDate.getMonth() - MONTHS_TO_SEARCH);
  } else {
    startDate.setDate(endDate.getDate() - DAYS_TO_SEARCH);
  }

  const updateParameters = <AirQualityUpdateParams[]>(
    DATASOURCES.nswAirQualityReadings.params
  );

  let errorMessages = await Promise.all(
    updateParameters.map((updateParameter) => {
      return new Promise<string>((resolve) => {
        updateAirQualityReadings(
          updateParameter,
          airQualitySitesMap,
          startDate,
          endDate
        ).then(
          () => resolve(""),
          (e) => {
            let message = `Error fetching ${updateParameter.parameters[0]}`;
            if (e instanceof Error) {
              message = `${message}: ${e.message}`;
            }
            logger(message, LogLevels.ERROR);
            resolve(message);
          }
        );
      });
    })
  );
  errorMessages = errorMessages.filter((msg) => msg !== "");

  if (errorMessages.length) {
    const errorMessage = errorMessages.join(", ");
    throw new Error(errorMessage);
  }
};

type GetDailyReadingsSignature = (
  airQualitySiteId: number,
  startDate: Date,
  endDate?: Date
) => Promise<DatewiseCategorySums>;

// fetch airquality readings by site and type from DB
export const getAirQualitySiteReadings: GetDailyReadingsSignature = async (
  airQualitySiteId,
  startDate,
  endDate
) => {
  const sequelize = getConnection();

  type WhereOpts = {
    date: {
      [Op.gte]: Date;
      [Op.lte]?: Date;
    };
    airQualitySiteId: number;
  };

  const whereOpts: WhereOpts = {
    date: {
      [Op.gte]: startDate,
    },
    airQualitySiteId,
  };

  if (endDate) {
    whereOpts.date = {
      ...whereOpts.date,
      [Op.lte]: endDate,
    };
  }

  const readings = await AirQualityReading.findAll({
    attributes: [
      [sequelize.literal(`DATE("date")`), "date"],
      "type",
      [sequelize.fn("AVG", sequelize.col("value")), "value"],
    ],
    where: whereOpts,
    group: ["date", "type"],
    order: [["date", "ASC"]],
  });
  const dailyAirQualityReadings: DatewiseCategorySums = {};
  readings.forEach(({ date, type, value }) => {
    const dateString = String(date);
    if (!value) return;
    if (!dailyAirQualityReadings[dateString]) {
      dailyAirQualityReadings[dateString] = {};
    }
    dailyAirQualityReadings[dateString][type] = value;
  });

  return dailyAirQualityReadings;
};
