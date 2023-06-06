import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import LineString from "ol/geom/LineString";
import { useState } from "react";
import { SelectedFeatures, SelectedPoint } from "./types";
import { grenseStyles } from "utils/map/layerStyles";

// TODO: hva skjer om man både har noe her og i dirty styles? antar kontekst fikser det.
// TODO: mye testing med edge cases her, må være litt systematisk
export const useSelectStyles = () => {
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>(
    []
  );

  const selectPointOnFeature = (
    coordinate: Coordinate,
    features: SelectedFeatures
  ) => {
    setSelectedPoint(coordinate);
    setSelectedFeatures(features as Feature<LineString>[]);
  };

  const selectFeatures = (features: SelectedFeatures) => {
    for (const feature of features) {
      feature.setStyle(grenseStyles.select);
    }
    setSelectedFeatures(features);
  };

  // TODO: må huske å gjøre dette hvis featurene ikke skal være synlige eller redigeres lengre elns
  const clearSelection = () => {
    setSelectedFeatures([]);
    setSelectedPoint(null);
  };

  return {
    selectedPoint,
    selectFeatures,
    selectedFeatures,
    selectPointOnFeature,
    clearSelection,
  };
};
