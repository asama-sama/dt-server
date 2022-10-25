import axios from "axios";

const BOM_NSW_STATIONS_URL =
  "http://www.bom.gov.au/nsw/observations/nswall.shtml";

export type WeatherStation = {
  name: string;
  id: string;
};

export const getStations = async () => {
  const res = await axios.get<string>(BOM_NSW_STATIONS_URL);
  const rows = res.data.matchAll(/products.*?<\/a>/g);
  const stations: WeatherStation[] = [];
  for (const row of rows) {
    const idMatch = row[0].match(/IDN.*?(?=\.shtml)/);
    const nameMatch = row[0].match(/.shtml">(.*?(?=<\/a>))/);
    const id = idMatch && idMatch[0];
    const name = nameMatch && nameMatch[1];
    if (id && name) {
      stations.push({
        name: name,
        id: id,
      });
    }
  }
  return stations;
};
