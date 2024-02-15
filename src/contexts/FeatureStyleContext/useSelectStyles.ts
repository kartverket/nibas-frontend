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

  const selectPointOnFeature = (coordinate: Coordinate, features: SelectedFeatures) => {
    selectFeatures(features);

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

  const selectFeatures = (features: SelectedFeatures) => {
    for (const feature of features) {
      feature.setStyle(grenseStyles.select);
    }
    setSelectedFeatures(features);
  };

  const removeSelection = () => {
    if (selectedPoint) {
      removeFeaturesFromSourceByIds("edit", [selectedPoint.getId() as string]);
    }
    setSelectedFeatures([]);
    setSelectedPoint(null);
    return selectedFeatures;
  };

  return {
    selectedPoint,
    selectFeatures,
    selectedFeatures,
    selectPointOnFeature,
    removeSelection,
  };
};
