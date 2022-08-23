import LineString from "ol/geom/LineString";
import { GrenseEntry } from "./types";
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
