export const listToSqlStringList = (list: Array<number>): string => {
  const stringlist = "('" + list.join("','") + "')";
  return stringlist;
};
