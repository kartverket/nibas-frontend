import LineString from "ol/geom/LineString";
import { GrenseEntry, HistoryEntry, MetadataEntry } from "./types";
import { editSource } from "hooks/layers/constants";

export const setFeatureCoordinatesForEntry = (
  entry: GrenseEntry,
  direction: "from" | "to"
) => {
  entry.changes.forEach((change) => {
    const lineString = editSource
      .getFeatureById(change.id)
      .getGeometry() as LineString;

    const coordinates = change[direction];

    if (!coordinates) return;

    lineString.setCoordinates(coordinates);
  });
};

export const setFeatureMetadataForEntry = (
  entry: MetadataEntry,
  direction: "from" | "to"
) => {
  entry.changes.forEach((change) => {
    const feature = editSource.getFeatureById(change.id);

    const metadata = change[direction];

    if (!metadata) return;

    feature.setProperties({ ...feature.getProperties(), metadata });
  });
};

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
