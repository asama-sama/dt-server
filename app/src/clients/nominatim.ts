import axios from "axios";

// handles queries to nominatim to abide by terms of use

const { NODE_ENV } = process.env;

const suburbQueue: string[] = [];

type CallbackFn = (result: object, suburbName: string) => Promise<void>;

export const bulkSearch = async (
  suburbNames: string[],
  callback: CallbackFn
) => {
  const { FETCH_SUBURBS, NOMINATIM_API_TIMEOUT } = process.env;

  const nominatimApiTimeout = parseInt(NOMINATIM_API_TIMEOUT || "");
  const apiTimeout = !isNaN(nominatimApiTimeout) ? nominatimApiTimeout : 1500;
  if (FETCH_SUBURBS !== "yes") {
    return [];
  }
  for (const suburbName of suburbNames) {
    if (NODE_ENV !== "test") console.log(`fetch ${suburbName} from nomatim`);
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${suburbName}&format=json&polygon_geojson=1&addressdetails=1&countrycodes=au&limit=1`
    );
    await callback(res.data[0], suburbName);
    await new Promise((r) => setTimeout(r, apiTimeout)); // wait 1.5 seconds to not make nominatim angry
  }
  suburbQueue.length = 0;
  if (NODE_ENV !== "test") console.log("nomatim fetch complete");
};
