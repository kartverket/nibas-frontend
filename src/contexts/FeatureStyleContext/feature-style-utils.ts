import { HistoryEntry, HistoryState } from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import {
  FeatureIdWithEndpoints,
  getFeatureIfExistsInAnyLayer,
  getFeaturesConnectedToFeatureAtEndpoints,
  isFeatureDeadEnd,
} from "utils/features";

export const getEntriesUpToIndex = (
  history: HistoryState,
  filter?: (value: HistoryEntry, index: number, array: HistoryEntry[]) => boolean,
): HistoryEntry[] => {
  const filterFn = filter ? filter : () => true;
  return history.entries.slice(0, history.index).filter(filterFn);
};

export const mapAffectedFeaturesForErrorEntries = (entry: HistoryEntry) => {
  const changes = entry.changes;
  const accumulator: Feature<Geometry>[] = [];
  for (const change of changes) {
    const feature = getFeatureIfExistsInAnyLayer(change.id);

    if (!feature) {
      continue;
    } else if (entry.type === "grense" || entry.type === "nygrense") {
      accumulator.push(feature);
    } else if (entry.type === "grensearkivering") {
      accumulator.push(...getFeaturesConnectedToFeatureAtEndpoints(feature));
    }
  }
  return accumulator;
};

export const removeDuplicateIds = (featureIds: string[]) => [...new Set(featureIds)];

export const filterOnlyDeadEnds = (featureEndpointsToCheck: FeatureIdWithEndpoints[], excludedFeatureIds: string[]) => {
  return function (feature: Feature<Geometry>) {
    const featureId = feature.getId()?.toString();
    if (feature != null && featureId != null && !excludedFeatureIds.includes(featureId)) {
      return isFeatureDeadEnd(feature, featureEndpointsToCheck);
    }
    return false;
  };
};
