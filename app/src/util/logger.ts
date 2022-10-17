enum LogLevels {
  "LOG",
  "ERROR",
}

export const logger = (
  message: string,
  level: LogLevels = LogLevels.LOG,
  showTest = false
) => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === "test" && !showTest) return;
  if (level === LogLevels.ERROR) {
    console.error(message);
  } else if (level === LogLevels.LOG) {
    console.log(message);
  }
};
