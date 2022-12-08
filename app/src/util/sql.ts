export const listToSqlStringList = (list: Array<number>): string => {
  const stringlist = "('" + list.join("','") + "')";
  return stringlist;
};

export const listToSqlPrimList = (list: Array<number>): string => {
  const stringlist = "(" + list.join(",") + ")";
  return stringlist;
};
