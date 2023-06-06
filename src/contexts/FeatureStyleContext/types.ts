import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import LineString from "ol/geom/LineString";

export type SelectedFeatures = Feature<LineString>[];
export type SelectedPoint = Coordinate | null;

export type FeatureStyleContextValue = {
  selectedPoint: SelectedPoint;
  selectedFeatures: SelectedFeatures;
  clearSelection: () => void;
  selectFeatures: (features: SelectedFeatures) => void;
  selectPointOnFeature: (
    coordinate: Coordinate,
    features: SelectedFeatures
  ) => void;

  setAndSaveUtkastFeatures: (features: string[]) => void;
  setAndSaveSammenslaaingsFeatures: (
    features: string[],
    overlappingFeatures: string[]
  ) => void;
  dirtyFeatureIds: string[];
  clearDirtyStyles: () => void;
};
