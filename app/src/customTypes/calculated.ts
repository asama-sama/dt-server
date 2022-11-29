export type DatewiseCategorySums = {
  [date: string]: {
    // date is yyyy-mm-dd
    [type: string]: number; // type is pollutant type, number is the reading
  };
};
