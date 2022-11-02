export const createBatches = <T>(list: Array<T>, batchSize: number): T[][] => {
  const batches: T[][] = [];
  let batch: T[] = [];
  for (let idx = 0; idx < list.length; idx++) {
    if (idx > 0 && idx % batchSize === 0) {
      batches.push(batch);
      batch = [];
    }
    batch.push(list[idx]);
  }
  batches.push(batch);
  return batches;
};
