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
  const searchResults = await bulkSearch(uniqueSuburbNames);
  for (let i = 0; i < searchResults.length; i++) {
    const suburbName = uniqueSuburbNames[i];
    const suburbKey = suburbKeyNameMapping[suburbName];
    const suburb = suburbMapping[suburbKey];
    // for suburbs that span two suburbs ie. with +, make sure to keep data for both
    await suburb.reload();
    await suburb.update({
      geoData: {
        ...suburb.geoData,
        [suburbName]: searchResults[i],
      },
    });
  }
};
