import { HistoryEntry } from "contexts/HistoryContext";

export const getFeatureIdsFromEntries = (
  accumulator: string[][],
  entry: HistoryEntry
) => {
  const featureIds: string[] = [];
  entry.changes.forEach((change) => {
    if (change.to && !accumulator.some((value) => value.includes(change.id))) {
      featureIds.push(change.id);
    }
  });
  accumulator.push(featureIds);
  return accumulator;
};
