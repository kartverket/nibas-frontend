import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { useState } from "react";
import { SelectedFeatures } from "./types";
import { grenseStyles, selectedPointStyle } from "utils/map/layerStyles";
import Point from "ol/geom/Point";
import { editSource } from "hooks/layers/constants";
import { removeFeaturesFromSourceByIds } from "utils/map/source";

export const useSelectStyles = () => {
  const [selectedPoint, setSelectedPoint] = useState<Feature<Point> | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>([]);

  const selectPointOnFeature = (coordinate: Coordinate) => {
    if (selectedPoint) {
      const geometry = selectedPoint.getGeometry() as Point;
      geometry.setCoordinates(coordinate);
    } else {
      const geometry = new Point(coordinate);
      const highlightPoint = new Feature(geometry);
      highlightPoint.setId("temp-point-highlight");
      highlightPoint.setStyle(selectedPointStyle);
      editSource.addFeatures([highlightPoint]);
      setSelectedPoint(highlightPoint);
    }
  };

  const setSelectedFeatureStyles = (features: SelectedFeatures) => {
    for (const feature of features) {
      feature.setStyle(grenseStyles.select);
    }
  };

  const selectFeatures = (features: SelectedFeatures) => {
    setSelectedFeatureStyles(features);
    setSelectedFeatures(features);
  };

  const removeSelection = () => {
    clearSelectedPoint();
    setSelectedFeatures([]);
    return selectedFeatures;
  };

  const clearSelectedPoint = () => {
    if (selectedPoint) {
      const selectedPointId = selectedPoint.getId()?.toString();
      if (selectedPointId != null) {
        removeFeaturesFromSourceByIds("edit", [selectedPointId]);
      }
    }
    setSelectedPoint(null);
  };

  return {
    selectedPoint,
    selectFeatures,
    selectedFeatures,
    selectPointOnFeature,
    setSelectedFeatureStyles,
    removeSelection,
    clearSelectedPoint,
  };
};
