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
} from "./types";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { setDefaultFeatureProperties } from "utils/features";
import { FeatureProperties } from "types/api";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";

const getFeatureFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const existingFeature = getFeatureIfExists(change.id);
  if (!existingFeature && direction === "to" && change[direction].coordinates) {
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
  return editSource.getFeatureById(featureId) as Feature<Geometry> | null;
};

const setCoordinatesFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const feature = getFeatureFromChange(change, direction);
  if (!feature) return;

  const lineString = feature.getGeometry() as LineString;

  if (direction === "from" && !change[direction].coordinates) {
    editSource.removeFeature(feature);
  }

  const coordinates = change[direction].coordinates;
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

  const properties = change[direction];

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

    const kontekstEgenskaper = change[direction];

    if (!kontekstEgenskaper) return;

    feature.setProperties({ ...feature.getProperties(), kontekstEgenskaper });
  });
};

export const redoArchiving = (entry: GrenseArkiveringsEntry) => {
  const features = entry.changes.map((c) => editSource.getFeatureById(c.id) as Feature<Geometry>);
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
  const features = entry.changes.map((c) => editSource.getFeatureById(c.id) as Feature<Geometry>);
  const featureIds = entry.changes.map((c) => c.id);

  addFeaturesToSource("edit", features);
  removeFeaturesFromSourceByIds("archived", featureIds);

  return document.dispatchEvent(
    new CustomEvent("grensearkiveringUndo", {
      detail: { entry },
    }),
  );
};

export const redoGrenseDeling = (deltFeature: Feature, newFeaturesFromsDeling: Feature[]) => {
  const properties = deltFeature.getProperties() as FeatureProperties;
  deltFeature.setProperties({ ...properties, shouldArchive: true });
  const deltFeatureId = deltFeature.getId() as string;
  addFeaturesToSource("edit", newFeaturesFromsDeling);
  removeFeaturesFromSourceByIds("edit", [deltFeatureId]);

  // Hvis featuren som ble delt er en eksisterende feature vil vi vise den som arkivert
  if (!isTempFeatureId(deltFeatureId)) {
    addFeaturesToSource("archived", [deltFeature]);
  }
};

export const undoGrenseDeling = (deltFeature: Feature, newFeaturesFromsDeling: Feature[]) => {
  const idsToRemove = newFeaturesFromsDeling.map((feature) => feature.getId() as string);
  const properties = deltFeature.getProperties() as FeatureProperties;
  deltFeature.setProperties({ ...properties, shouldArchive: false });
  removeFeaturesFromSourceByIds("edit", idsToRemove);
  addFeaturesToSource("edit", [deltFeature]);

  // Om featuren som ble splittet ikke var en ny grense vises den som artkivert, vi må derfor fjerne den fra archived layer
  if (!isTempFeatureId(deltFeature.getId())) {
    removeFeaturesFromSourceByIds("archived", [deltFeature.getId() as string]);
  }
};
