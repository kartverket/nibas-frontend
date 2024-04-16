import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Geometry } from "ol/geom";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";

export type SelectedPoint = Feature<Point> | null;

export type FeatureStyleContextValue = {
  selectedFeatures: Feature<LineString>[];
  selectPointOnFeature: (coordinate: Coordinate, features: Feature<LineString>[]) => void;
  selectFeatures: (features: Feature<LineString>[]) => void;
  selectedPoint: SelectedPoint;
  clearSelection: () => void;
  clearSelectedPoint: () => void;
  addToSelection: (feature: Feature<LineString>) => void;
  removeFromSelection: (feature: Feature<LineString>) => void;
  isSelectedFeature: (feature: Feature<LineString>) => boolean;

  addDirtyStyles: (featureIds: string[]) => void;
  addErrorStyles: (featureIds: string[]) => void;
  addArchivedStyles: (featureIds: string[]) => void;

  setFeatureStylesForUtkast: (editedFeatures: Feature<Geometry>[], sammenslaaingFeatures: Feature<Geometry>[]) => void;

  setAndSaveSammenslaaingStyles: (features: string[]) => void;
  setAndSaveSammenslaaingOverlappingStyles: (features: string[]) => void;

  clearFeatureStyles: () => void;
};
