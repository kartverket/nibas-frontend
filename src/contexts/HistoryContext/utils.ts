import LineString from "ol/geom/LineString";
import {
  HistoryDirection,
  GrenseEntry,
  GrenseTilhorighetEntry,
  HistoryChange,
  MetadataEntry,
  MinimalGrense,
  NyGrenseEntry,
} from "./types";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { setDefaultFeatureProperties } from "utils/features";
import { Metadata } from "types/api";

const getFeatureFromChange = (
  change: HistoryChange<MinimalGrense>,
  direction: HistoryDirection,
) => {
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

const setCoordinatesFromChange = (
  change: HistoryChange<MinimalGrense>,
  direction: HistoryDirection,
) => {
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

export const setFeatureCoordinatesForEntry = (
  entry: GrenseEntry,
  direction: HistoryDirection,
) => {
  entry.changes.forEach((change) =>
    setCoordinatesFromChange(change, direction),
  );

  return document.dispatchEvent(
    new CustomEvent(direction === "from" ? "grenseUndo" : "grenseRedo", {
      detail: { entry },
    }),
  );
};

const setMetadataFromChange = (
  change: HistoryChange<Metadata>,
  direction: HistoryDirection,
) => {
  const feature = getFeatureIfExists(change.id);
  if (!feature) return;

  const metadata = change[direction];

  if (!metadata) return;

  feature.setProperties({ ...feature.getProperties(), metadata });
};

export const setFeatureMetadataForEntry = (
  entry: MetadataEntry,
  direction: HistoryDirection,
) => {
  entry.changes.forEach((change) => setMetadataFromChange(change, direction));
};

export const setFeatureCoordinatesAndMetadataForEntry = (
  entry: NyGrenseEntry,
  direction: HistoryDirection,
) => {
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
