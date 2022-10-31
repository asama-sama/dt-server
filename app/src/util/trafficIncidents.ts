import { categorySubcategoryMap } from "../const/trafficIncidents";

export const getTrafficIncidentCategory = (
  subcategoryToFind: string
): string => {
  let categoryToSet = "uncategorised";
  subcategoryToFind = subcategoryToFind.toLowerCase();
  for (const category in categorySubcategoryMap) {
    const found = categorySubcategoryMap[category].find((subcategory) => {
      subcategory = subcategory.toLowerCase();
      let match = subcategory.match(new RegExp(`.*?${subcategoryToFind}.*?`));
      if (match) return match;
      match = subcategoryToFind.match(new RegExp(`.*?${subcategory}.*?`));
      return match;
    });
    if (found) {
      categoryToSet = category;
      break;
    }
  }
  return categoryToSet.toLowerCase();
};
