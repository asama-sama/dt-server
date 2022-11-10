export const enum LogLevels {
  "LOG",
  "ERROR",
}

export const logger = (message: string, level: LogLevels = LogLevels.LOG) => {
  if (level === LogLevels.ERROR) {
    console.error(message);
  } else if (level === LogLevels.LOG) {
    console.log(message);
  }
};
