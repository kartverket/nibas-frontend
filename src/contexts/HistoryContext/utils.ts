import LineString from "ol/geom/LineString";
import {
  HistoryDirection,
  GrenseEntry,
  GrenseTilhorighetEntry,
  HistoryChange,
  MinimalGrense,
  NyGrenseEntry,
  PropertyEntry,
} from "./types";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { setDefaultFeatureProperties } from "utils/features";
import { FeatureProperties, Metadata } from "types/api";
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

const setMetadataFromChange = (change: HistoryChange<Metadata>, direction: HistoryDirection) => {
  const feature = getFeatureIfExists(change.id);
  if (!feature) return;

  const metadata = change[direction];

  if (!metadata) return;

  feature.setProperties({ ...feature.getProperties(), metadata });
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

export const setFeatureCoordinatesAndMetadataForEntry = (entry: NyGrenseEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => {
    setMetadataFromChange(change, direction);
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

export const redoSplitting = (splittedFeature: Feature, newFeaturesFromsSplit: Feature[]) => {
  const properties = splittedFeature.getProperties() as FeatureProperties;
  splittedFeature.setProperties({ ...properties, shouldArchive: true });
  addFeaturesToSource("edit", newFeaturesFromsSplit);

  // Hvis featuren som ble splittet er en ny feature så ønsker vi ikke å vise den som arkivert, så vi fjerner den fra OL
  const splittedFeatureId = splittedFeature.getId() as string;
  if (isTempFeatureId(splittedFeatureId)) {
    removeFeaturesFromSourceByIds("edit", [splittedFeatureId]);
  }
};

export const undoSplitting = (splittedFeature: Feature, newFeaturesFromsSplit: Feature[]) => {
  const idsToRemove = newFeaturesFromsSplit.map((feature) => feature.getId() as string);
  const properties = splittedFeature.getProperties() as FeatureProperties;
  splittedFeature.setProperties({ ...properties, shouldArchive: false });
  removeFeaturesFromSourceByIds("edit", idsToRemove);

  // Om featuren som ble splittet var en ny grense så har vi fjernet den fra OL, vi må derfor legge den tilbake
  if (isTempFeatureId(splittedFeature.getId())) {
    addFeaturesToSource("edit", [splittedFeature]);
  }
};
