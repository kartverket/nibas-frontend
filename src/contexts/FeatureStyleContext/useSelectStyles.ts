import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { useState } from "react";
import { grenseStyles, selectedPointStyle } from "utils/map/layerStyles";
import Point from "ol/geom/Point";
import { editSource } from "hooks/layers/constants";
import { removeFeaturesFromSourceByIds } from "utils/map/source";
import { LineString } from "ol/geom";
import Style from "ol/style/Style";

export const useSelectStyles = () => {
  const [selectedPoint, setSelectedPoint] = useState<Feature<Point> | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature<LineString>[]>([]);

  const selectPointOnFeature = (coordinate: Coordinate, style?: Style) => {
    if (selectedPoint) {
      selectedPoint.getGeometry()?.setCoordinates(coordinate);
    } else {
      const highlightPoint = new Feature(new Point(coordinate));
      highlightPoint.setId("temp-point-highlight");
      highlightPoint.setStyle(style ?? selectedPointStyle);
      editSource.addFeatures([highlightPoint]);
      setSelectedPoint(highlightPoint);
    }
  };

  const renderSelectStyles = (features: Feature<LineString>[]) => {
    for (const feature of features) {
      feature.setStyle(grenseStyles.select);
    }
  };

  const selectFeatures = (features: Feature<LineString>[]) => {
    renderSelectStyles(features);
    setSelectedFeatures(features);
  };

  const resetSelection = () => {
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
      setSelectedPoint(null);
    }
  };

  const isSelectedFeature = (feature: Feature<LineString>) =>
    selectedFeatures.some((sf) => sf.getId() === feature.getId());

  const addToSelection = (feature: Feature<LineString>) => {
    if (!isSelectedFeature(feature)) {
      renderSelectStyles([feature]);
      setSelectedFeatures(selectedFeatures.concat(feature));
    }
  };

  const removeFromSelection = (feature: Feature<LineString>) => {
    if (isSelectedFeature(feature)) {
      setSelectedFeatures(selectedFeatures.filter((sf) => sf.getId() !== feature.getId()));
    }
  };

  return {
    selectedPoint,
    selectFeatures,
    selectedFeatures,
    selectPointOnFeature,
    renderSelectStyles,
    resetSelection,
    clearSelectedPoint,
    addToSelection,
    removeFromSelection,
    isSelectedFeature,
  };
};
