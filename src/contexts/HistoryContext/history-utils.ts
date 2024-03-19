import LineString from "ol/geom/LineString";
import {
  HistoryDirection,
  GrenseEntry,
  GrenseTilhorighetEntry,
  HistoryChange,
  MinimalGrense,
  NyGrenseEntry,
  PropertyEntry,
  GrenseArkiveringsEntry,
  HistoryEntry,
  HistoryState,
} from "./types";
import { archivedSource, editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { setDefaultFeatureProperties } from "utils/features";
import { FeatureProperties, KontekstEgenskaper } from "types/api";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { removeNull } from "utils/list-utils";
import { Geometry } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { getEntriesUpToIndex } from "contexts/FeatureStyleContext/feature-style-utils";

const getFeatureFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const existingFeature = getFeatureIfExists(change.id);
  if (!existingFeature && direction === "to") {
    const newFeature = new Feature({
      geometry: new LineString(change[direction].coordinates),
    });
    newFeature.setId(change.id);
    setDefaultFeatureProperties(newFeature, change.to.type);
    editSource.addFeature(newFeature);
    return newFeature;
  }

  return existingFeature;
};

const getFeatureIfExists = (featureId: string) => {
  return editSource.getFeatureById(featureId);
};

const setCoordinatesFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const feature = getFeatureFromChange(change, direction);
  if (!feature) return;

  const lineString = feature.getGeometry() as LineString;
  const coordinates = change[direction].coordinates as Coordinate[] | undefined;

  if (direction === "from" && !coordinates) {
    editSource.removeFeature(feature);
  }
  if (!coordinates) return;

  lineString.setCoordinates(coordinates);
};

export const setFeatureCoordinatesForEntry = (entry: GrenseEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => setCoordinatesFromChange(change, direction));

  return document.dispatchEvent(
    new CustomEvent(direction === "from" ? "grenseUndo" : "grenseRedo", {
      detail: { entry },
    }),
  );
};

const setPropertiesFromChange = (change: HistoryChange<FeatureProperties>, direction: HistoryDirection) => {
  const feature = getFeatureIfExists(change.id);
  if (!feature) return;

  const properties = change[direction] as FeatureProperties | undefined;
  if (!properties) return;

  feature.setProperties(properties);
};

export const setFeaturePropertiesForEntry = (entry: PropertyEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => setPropertiesFromChange(change, direction));
};

export const setFeatureCoordinatesAndPropertiesForEntry = (entry: NyGrenseEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => {
    setPropertiesFromChange(change, direction);
    setCoordinatesFromChange(change, direction);
  });
};

export const setKontekstEgenskaperForEntry = (entry: GrenseTilhorighetEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => {
    const feature = getFeatureIfExists(change.id);
    if (!feature) return;

    const kontekstEgenskaper = change[direction] as KontekstEgenskaper[] | undefined;

    if (!kontekstEgenskaper) return;

    feature.setProperties({ ...feature.getProperties(), kontekstEgenskaper });
  });
};

export const redoArchiving = (entry: GrenseArkiveringsEntry) => {
  const features = removeNull(entry.changes.map((c) => editSource.getFeatureById(c.id)));
  const featureIds = entry.changes.map((c) => c.id);

  addFeaturesToSource("archived", features);
  removeFeaturesFromSourceByIds("edit", featureIds);

  return document.dispatchEvent(
    new CustomEvent("grensearkiveringRedo", {
      detail: { entry },
    }),
  );
};

export const undoArchving = (entry: GrenseArkiveringsEntry) => {
  const features = removeNull(entry.changes.map((c) => archivedSource.getFeatureById(c.id)));
  const featureIds = entry.changes.map((c) => c.id);

  addFeaturesToSource("edit", features);
  removeFeaturesFromSourceByIds("archived", featureIds);

  return document.dispatchEvent(
    new CustomEvent("grensearkiveringUndo", {
      detail: { entry },
    }),
  );
};

export const redoGrensedeling = (deltFeature: Feature, newFeaturesFromsDeling: Feature[]) => {
  const properties = deltFeature.getProperties() as FeatureProperties;
  deltFeature.setProperties({ ...properties, shouldArchive: true });
  const deltFeatureId = deltFeature.getId()?.toString();
  if (deltFeatureId != null) {
    addFeaturesToSource("edit", newFeaturesFromsDeling);
    removeFeaturesFromSourceByIds("edit", [deltFeatureId]);

    // Hvis featuren som ble delt er en eksisterende feature vil vi vise den som arkivert
    if (!isTempFeatureId(deltFeatureId)) {
      addFeaturesToSource("archived", [deltFeature]);
    }
  }
};

export const undoGrensedeling = (deltFeature: Feature, newFeaturesFromsDeling: Feature[]) => {
  const idsToRemove = removeNull(newFeaturesFromsDeling.map((feature) => feature.getId()?.toString()));
  const properties = deltFeature.getProperties() as FeatureProperties;
  deltFeature.setProperties({ ...properties, shouldArchive: false });

  removeFeaturesFromSourceByIds("edit", idsToRemove);
  addFeaturesToSource("edit", [deltFeature]);

  const deltFeatureId = deltFeature.getId()?.toString();

  if (deltFeatureId != null) {
    if (!isTempFeatureId(deltFeatureId)) {
      removeFeaturesFromSourceByIds("archived", [deltFeatureId]);
    }
  }
  // Om featuren som ble splittet ikke var en ny grense vises den som artkivert, vi må derfor fjerne den fra archived layer
};
export const getChangeIds = (historyEntry: HistoryEntry): string[] => {
  const changedFeatureIds: string[] = [];
  historyEntry.changes.forEach((change) => {
    if (change.to == null) return;

    if (historyEntry.type === "grensedeling") {
      const changesTo = change.to as Feature<Geometry>[];
      const idsToAppend = removeNull(changesTo.map((feature) => feature.getId()?.toString()).filter(Boolean));
      changedFeatureIds.push(...idsToAppend);
    }
    changedFeatureIds.push(change.id);
  });
  return changedFeatureIds;
};
/**
 * Hjelpefunksjon for å lete etter featureIds til nye grenser som kun eksisterer etter nåværende indexposisjon
 * @param featureId ID å sjekke mot
 * @param history HistoryState
 * @returns true dersom IDen ikke finnes i nåværende delmengde av history, ellers false.
 */

export const newFeatureOnlyExistsAfterIndex = (featureId: string, history: HistoryState) => {
  const idsUpToIndex = getEntriesUpToIndex(history).flatMap(getChangeIds);

  return !idsUpToIndex.includes(featureId) && isTempFeatureId(featureId);
};
