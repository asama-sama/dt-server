import { Suburb } from "../db/models/Suburb";
import { bulkSearch } from "../clients/nominatim";

const NSW_VIEW_BOX = {
  lon1: 140.946853,
  lat1: -27.684145,
  lon2: 153.053786,
  lat2: -37.927417,
};

export const updateSuburbGeoJson = async () => {
  const suburbs = await Suburb.findAll({
    where: {
      geometry: null,
      fetchFailed: false,
    },
    order: [["id", "asc"]],
  });
  const suburbMap: { [key: string]: Suburb } = {};

  const suburbSearchParameters = suburbs.map((suburb) => {
    suburbMap[suburb.name] = suburb;
    return {
      name: suburb.name,
      state: "nsw",
      viewbox: NSW_VIEW_BOX,
    };
  });
  await bulkSearch(
    suburbSearchParameters,
    async (result, suburbName) => {
      const suburb = suburbMap[suburbName];
      await suburb.reload();
      await suburb.update({
        geometry: result.geojson,
      });
    },
    async (suburbName) => {
      const suburb = suburbMap[suburbName];
      await suburb.reload();
      await suburb.update({ fetchFailed: true });
    }
  );
};

export const parseSuburbNames = (name: string) => {
  const nameUpperCase = name.toUpperCase();
  const plusReg = new RegExp(/\s?\+\s?/);
  if (nameUpperCase.match(plusReg)) return nameUpperCase.split(plusReg);
  const toReg = new RegExp(/\sTO\s/);
  if (nameUpperCase.match(toReg)) return nameUpperCase.split(toReg);
  const commaReg = new RegExp(/\s?,\s?/);
  if (nameUpperCase.match(commaReg)) return nameUpperCase.split(commaReg);
  const hyphenReg = new RegExp(/\s?-\s?/);
  if (nameUpperCase.match(hyphenReg)) return nameUpperCase.split(hyphenReg);
  const andReg = new RegExp(/\sAND\s/);
  if (nameUpperCase.match(andReg)) return nameUpperCase.split(andReg);
  return [nameUpperCase];
};
