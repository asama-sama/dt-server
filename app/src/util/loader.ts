import { logger } from "./logger";

export type LoadIndicators = { [key: number]: boolean };

export class Loader {
  size: number;
  numLoaded = 0;
  loadIndicators: { [key: number]: boolean } = {};

  constructor(size: number) {
    this.size = size;

    this.createLoadIndicator();
  }

  createLoadIndicator = () => {
    let loadMark = 0;
    const loadIndicators: LoadIndicators = {};
    // const loadedMarks = []
    while (loadMark <= 100) {
      loadIndicators[loadMark] = false;
      // loadedMarks.push(loadMark)
      loadMark += 5;
    }
    this.loadIndicators = loadIndicators;
  };

  tick() {
    if (!this.size || !this.loadIndicators)
      throw new Error("load indicator must be initialised");
    this.numLoaded += 1;
    this.markLoaded(this.numLoaded / this.size);
  }

  markLoaded = (percentage: number) => {
    const indicatorsToToggle = Object.keys(this.loadIndicators).filter(
      (indicator) => {
        const indicatorNum = parseInt(indicator);
        return (
          indicatorNum <= percentage * 100 &&
          this.loadIndicators[indicatorNum] === false
        );
      }
    );
    if (indicatorsToToggle.length) {
      for (const indicator of indicatorsToToggle) {
        const indicatorToToggleNum = parseInt(indicator);
        this.loadIndicators[indicatorToToggleNum] = true;
        logger(`${indicator}% complete`);
      }
    }
  };
}
