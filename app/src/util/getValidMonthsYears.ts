export const getValidMonthsYears = (
  lastYear: number,
  lastMonth: number,
  numMonthsToSearch: number
) => {
  const monthsToSearch: number[] = [];
  const yearsToSearch: number[] = [lastYear];
  for (let i = 0; i < numMonthsToSearch; i++) {
    let monthToAdd = lastMonth - i;
    while (monthToAdd <= 0) {
      monthToAdd = 12 + monthToAdd;
    }
    if (monthToAdd === 12) {
      const yearsDiff = Math.ceil(i / 12);
      yearsToSearch.push(lastYear - yearsDiff);
    }
    monthsToSearch.push(monthToAdd);
  }
  return {
    monthsToSearch: [...new Set(monthsToSearch)],
    yearsToSearch,
  };
};
