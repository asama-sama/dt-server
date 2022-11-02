import { Frequency, UpdateFrequency } from "../db/models/UpdateFrequency";

export const seed = async () => {
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.HOURLY,
    },
  });
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.DAILY,
    },
  });
  await UpdateFrequency.findOrCreate({
    where: {
      frequency: Frequency.MONTHLY,
    },
  });
};
