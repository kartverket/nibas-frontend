import { HistoryEntry, HistoryState } from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import {
  FeatureIdWithEndpoints,
  getFeatureIfExistsInAnyLayer,
  getFeaturesConnectedToFeatureAtEndpoints,
  isFeatureDeadEnd,
} from "utils/features";

/**
 * @param filter valgfritt filter for history entries
 * @returns En delmengde av HistoryEntries i historikken opp til nåværende index.
 */
export const getEntriesUpToIndex = (
  history: HistoryState,
  filter?: (value: HistoryEntry, index: number, array: HistoryEntry[]) => boolean,
): HistoryEntry[] => {
  const filterFn = filter ? filter : () => true;
  return history.entries.slice(0, history.index).filter(filterFn);
};

/**
 * Hjelpefunksjon for å lete etter featureIds til nye grenser som kun eksisterer etter nåværende indexposisjon
 * @param featureId ID å sjekke mot
 * @param idsUpToIndex IDer slicet mot index
 * @returns true dersom IDen ikke finnes i nåværende delmengde av history, ellers false.
 */
export const shouldIgnoreFeatureId = (featureId: string, idsUpToIndex: string[]) => {
  return !idsUpToIndex.includes(featureId) && isTempFeatureId(featureId);
};

export const mapAffectedFeaturesForErrorEntries = (entry: HistoryEntry) => {
  const changes = entry.changes;
  const accumulator: Feature<Geometry>[] = [];
  for (const change of changes) {
    const feature = getFeatureIfExistsInAnyLayer(change.id);

    if (!feature) continue;
    else if (entry.type === "nygrense" || entry.type === "grense") {
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
    if (feature && featureId && !excludedFeatureIds.includes(featureId)) {
      return isFeatureDeadEnd(feature, featureEndpointsToCheck);
    }
    return false;
  };
};
