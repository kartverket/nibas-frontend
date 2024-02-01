import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { Coordinate } from "ol/coordinate";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";

export type SelectedFeatures = Feature<LineString>[];
export type SelectedPoint = Feature<Point> | null;

export type FeatureStyleContextValue = {
    selectedPoint: SelectedPoint;
    selectedFeatures: SelectedFeatures;
    clearSelection: () => void;
    selectFeatures: (features: SelectedFeatures) => void;
    selectPointOnFeature: (coordinate: Coordinate, features: SelectedFeatures) => void;

    setAndSaveUtkastFeatures: (features: string[]) => void;
    setAndSaveSammenslaaingsFeatures: (features: string[], overlappingFeatures: string[]) => void;
    clearFeatureStyles: () => void;

    featureIsEditable: (feature: FeatureLike) => boolean;
    featureIsArchived: (feature: FeatureLike) => boolean;
    setArchivedFeatures: (features: string[]) => void;
    setAndSaveUtkastArchivedFeatures: (features: string[]) => void;
};
