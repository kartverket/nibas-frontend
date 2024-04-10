import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { Coordinate } from "ol/coordinate";
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
  setAndSaveDirtyStyles: (featureIds: string[]) => void;

  addErrorStyles: (featureIds: string[]) => void;
  setAndSaveErrorStyles: (featureIds: string[]) => void;

  addArchivedStyles: (featureIds: string[]) => void;
  setAndSaveArchivedStyles: (features: string[]) => void;
  featureIsArchived: (feature: FeatureLike) => boolean;

  setAndSaveSammenslaaingStyles: (features: string[]) => void;
  setAndSaveSammenslaaingOverlappingStyles: (features: string[]) => void;

  clearFeatureStyles: () => void;
};
