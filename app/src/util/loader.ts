export type LoadIndicators = { [key: number]: boolean };

export const createLoadIndicator = () => {
  let loadMark = 0;
  const loadIndicators: LoadIndicators = {};
  // const loadedMarks = []
  while (loadMark <= 100) {
    loadIndicators[loadMark] = false;
    // loadedMarks.push(loadMark)
    loadMark += 5;
  }
  return loadIndicators;
};

export const markLoaded = (
  loadIndicator: LoadIndicators,
  percentage: number
) => {
  const indicatorsToToggle = Object.keys(loadIndicator).filter((indicator) => {
    const indicatorNum = parseInt(indicator);
    return indicatorNum <= percentage && !loadIndicator[indicatorNum];
  });
  if (indicatorsToToggle.length) {
    for (const indicator of indicatorsToToggle) {
      const indicatorToToggleNum = parseInt(indicator);
      loadIndicator[indicatorToToggleNum] = true;
      if (process.env.NODE_ENV !== "test") {
        console.log(`${indicator}% complete`, process.env.NODE_ENV);
      }
    }
  }
};
