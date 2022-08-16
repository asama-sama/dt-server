import axios from "axios";

// handles queries to nominatim to abide by terms of use

export const bulkSearch = async (queries: string[]) => {
  const { FETCH_SUBURBS, NOMINATIM_API_TIMEOUT } = process.env;

  const nominatimApiTimeout = parseInt(NOMINATIM_API_TIMEOUT || "");
  const apiTimeout = !isNaN(nominatimApiTimeout) ? nominatimApiTimeout : 1500;
  const results: object[] = [];
  if (FETCH_SUBURBS !== "yes") {
    return [];
  }
  for (const query of queries) {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1&addressdetails=1&countrycodes=au&limit=1`
    );
    results.push(res);
    await new Promise((r) => setTimeout(r, apiTimeout)); // wait 1.5 seconds to not make nominatim angry
  }
  return results;
};
