import { Suburb } from "../db/models/Suburb";
import { bulkSearch } from "../clients/nominatim";

export const updateSuburbGeoJson = async () => {
  const suburbs = await Suburb.findAll({
    where: {
      geoData: null,
    },
  });
  const suburbMapping: { [key: string]: Suburb } = {};
  const suburbKeyNameMapping: { [key: string]: string } = {};
  const uniqueSuburbNamesSet = new Set<string>();

  for (const suburb of suburbs) {
    suburbMapping[suburb.name] = suburb;
    const suburbNames = suburb.name.split("+");
    for (const suburbName of suburbNames) {
      const name = suburbName.trim();
      suburbKeyNameMapping[name] = suburb.name;
      uniqueSuburbNamesSet.add(name);
    }
  }
  const uniqueSuburbNames = [...uniqueSuburbNamesSet];
  const suburbSearchParameters = uniqueSuburbNames.map((name) => ({
    name,
    state: "nsw",
  }));
  await bulkSearch(
    suburbSearchParameters,
    async (result: object, suburbName: string) => {
      const suburbKey = suburbKeyNameMapping[suburbName];
      const suburb = suburbMapping[suburbKey];
      await suburb.update({
        geoData: {
          ...suburb.geoData,
          [suburbName]: result,
        },
      });
      await suburb.reload();
    }
  );
};

export const transformSuburbNames = (originalName: string) => {
  const nameUpperCase = originalName.toUpperCase();
  const nameRemovedTo = nameUpperCase.replace(/\sTO\s/, " + ");
  const nameRemoveHypen = nameRemovedTo.replace(/\s?-\s?/, " + ");
  return nameRemoveHypen;
};

export const parseSuburbNames = (name: string) => {
  const nameUpperCase = name.toUpperCase();
  const plusReg = new RegExp(/\s?\+\s?/);
  if (nameUpperCase.match(plusReg)) return nameUpperCase.split(plusReg);
  const toReg = new RegExp(/\sTO\s/);
  if (nameUpperCase.match(toReg)) return nameUpperCase.split(toReg);
  return [nameUpperCase];
};
