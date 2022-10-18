import axios from "axios";

// handles queries to nominatim to abide by terms of use

const { NODE_ENV } = process.env;

type SuburbSearchParameters = {
  name: string;
  state: string;
};

type CallbackFn = (result: object, suburbName: string) => Promise<void>;

export const bulkSearch = async (
  suburbSearchParameters: SuburbSearchParameters[],
  callback: CallbackFn
) => {
  const { FETCH_SUBURBS, NOMINATIM_API_TIMEOUT } = process.env;

  const nominatimApiTimeout = parseInt(NOMINATIM_API_TIMEOUT || "");
  const apiTimeout = !isNaN(nominatimApiTimeout) ? nominatimApiTimeout : 1500;
  if (FETCH_SUBURBS !== "yes") {
    return [];
  }
  for (const { name, state } of suburbSearchParameters) {
    if (NODE_ENV !== "test") console.log(`fetch ${name},${state} from nomatim`);
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${name},${state}&format=json&polygon_geojson=1&addressdetails=1&countrycodes=au&limit=1`
    );
    await callback(res.data[0], name);
    await new Promise((r) => setTimeout(r, apiTimeout)); // wait 1.5 seconds to not make nominatim angry
  }
  if (NODE_ENV !== "test") console.log("nomatim fetch complete");
};
