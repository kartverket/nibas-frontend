import LineString from "ol/geom/LineString";
import { GrenseEntry, MetadataEntry } from "./types";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

export const setFeatureCoordinatesForEntry = (
  entry: GrenseEntry,
  direction: "from" | "to",
) => {
  entry.changes.forEach((change) => {
    const feature = editSource.getFeatureById(
      change.id,
    ) as Feature<Geometry> | null;
    if (!feature) return;

    const lineString = feature.getGeometry() as LineString;

    if (direction === "from" && !change[direction]) {
      editSource.removeFeature(feature);
    }

    const coordinates = change[direction];
    if (!coordinates) return;

    lineString.setCoordinates(coordinates);
  });

  return document.dispatchEvent(
    new CustomEvent(direction === "from" ? "grenseUndo" : "grenseRedo", {
      detail: { entry },
    }),
  );
};

export const setFeatureMetadataForEntry = (
  entry: MetadataEntry,
  direction: "from" | "to",
) => {
  entry.changes.forEach((change) => {
    const feature = editSource.getFeatureById(
      change.id,
    ) as Feature<Geometry> | null;
    if (!feature) return;

    const metadata = change[direction];

    if (!metadata) return;

    feature.setProperties({ ...feature.getProperties(), metadata });
  });
};
