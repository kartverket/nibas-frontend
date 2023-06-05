import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import LineString from "ol/geom/LineString";
import { useState } from "react";
import { SelectedFeatures, SelectedPoint } from "./types";

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
    // TODO: sett stil til det de skal være
    setSelectedPoint(coordinate);
    setSelectedFeatures(features as Feature<LineString>[]);
  };

  const clearSelection = () => {
    // TODO: sett styles tilbake til det de skal være, hva nå enn det er
    setSelectedFeatures([]);
    setSelectedPoint(null);
  };

  return {
    selectedPoint,
    selectedFeatures,
    selectPointOnFeature,
    clearSelection,
    setSelectedFeatures,
  };
};
