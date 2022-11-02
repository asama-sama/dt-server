import { categorySubcategoryMap } from "../const/trafficIncidents";
import { TrafficIncidentCategory } from "../db/models/TrafficIncidentCategory";

export const getTrafficIncidentCategory = (
  subcategoryToFind: string
): string | null => {
  let categoryToSet = null;
  subcategoryToFind = subcategoryToFind.toUpperCase();
  for (const category in categorySubcategoryMap) {
    const found = categorySubcategoryMap[category].find((subcategory) => {
      subcategory = subcategory.toUpperCase();
      let match = subcategory.match(new RegExp(`.*?${subcategoryToFind}.*?`));
      if (match) return match;
      match = subcategoryToFind.match(new RegExp(`.*?${subcategory}.*?`));
      return match;
    });
    if (found) {
      categoryToSet = category.toUpperCase();
      break;
    }
  }
  return categoryToSet;
};

export const updateTrafficIncidentCategories = async () => {
  const trafficIncidentCategories = await TrafficIncidentCategory.findAll({
    where: {
      category: null,
    },
  });
  for (const trafficIncidentCategory of trafficIncidentCategories) {
    const categoryToSet = getTrafficIncidentCategory(
      trafficIncidentCategory.subcategory
    );
    if (categoryToSet) {
      trafficIncidentCategory.category = categoryToSet;
      await trafficIncidentCategory.save();
    }
  }
};
