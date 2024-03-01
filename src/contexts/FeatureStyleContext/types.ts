import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { Coordinate } from "ol/coordinate";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";

export type SelectedFeatures = Feature<LineString>[];
export type SelectedPoint = Feature<Point> | null;

export type FeatureStyleContextValue = {
  selectedFeatures: SelectedFeatures;
  selectPointOnFeature: (coordinate: Coordinate, features: SelectedFeatures) => void;
  selectFeatures: (features: SelectedFeatures) => void;
  selectedPoint: SelectedPoint;
  clearSelection: () => void;

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
