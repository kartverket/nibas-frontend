import { initialMapCenter, initialMapZoom, map } from "pages/Kart/constants";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";

export const resetMapView = () => {
  const view = map.getView();

  view.animate({
    zoom: initialMapZoom,
    center: initialMapCenter,
    duration: 500,
  });
};

const calculateFeaturesExtent = (features: Feature<Geometry>[]) => {
  const extent = features.reduce<number[] | null>((acc, feature) => {
    const featureExtent = feature.getGeometry()?.getExtent();

    if (!featureExtent) return acc;

    if (!acc) {
      return [
        featureExtent[0],
        featureExtent[1],
        featureExtent[2],
        featureExtent[3],
      ];
    }

    return [
      Math.min(acc[0], featureExtent[0]),
      Math.min(acc[1], featureExtent[1]),
      Math.max(acc[2], featureExtent[2]),
      Math.max(acc[3], featureExtent[3]),
    ];
  }, null);

  return extent;
};

export const zoomToFeatures = (features: Feature<Geometry>[]) => {
  if (features.length === 0) {
    resetMapView();
  }
  const extent = calculateFeaturesExtent(features);

  if (!extent) return;

  const view = map.getView();
  view.fit(extent, {
    padding: [200, 200, 200, 200],
    duration: 500,
  });
};

export const getAllVisibleFeatures = () => {
  const layers = map.getAllLayers();

  return layers.flatMap((layer) => {
    const source = layer.getSource();
    if (source instanceof VectorSource) {
      return source.getFeatures();
    }
    return [];
  });
};

export const getZoomMode = (
  isEditing: boolean,
  hasEditingInMap: boolean
): "edit" | "view" | "none" => {
  if (isEditing) {
    return "edit";
  }

  if (hasEditingInMap) {
    return "none";
  }

  return "view";
};

const isCoordinateEqual = (a: Coordinate, b: Coordinate) => {
  return a[0] === b[0] && a[1] === b[1];
};

const isFeatureConnectedToCoordinate = (
  feature: FeatureLike,
  coordinate: Coordinate
): boolean => {
  if (feature instanceof Feature) {
    const geometry = feature.getGeometry();
    if (geometry instanceof LineString) {
      const coordinates = geometry?.getCoordinates();
      const head = coordinates[0];
      const tail = coordinates[coordinates.length - 1];
      return (
        isCoordinateEqual(head, coordinate) ||
        isCoordinateEqual(tail, coordinate)
      );
    }
  }
  return false;
};

/**
 * Tar inn en grense og prøver å avgjøre om den er koblet til andre grenser i begge ender
 */
export const isFeatureDeadEnd = (feature: Feature<LineString>) => {
  const geometry = feature.getGeometry() as LineString;
  const coordinates = geometry?.getCoordinates() as Coordinate[];

  const head = coordinates[0];
  const tail = coordinates[coordinates.length - 1];

  const headFeatures = map.getFeaturesAtPixel(map.getPixelFromCoordinate(head));
  const tailFeatures = map.getFeaturesAtPixel(map.getPixelFromCoordinate(tail));

  const headConnected = headFeatures.some((f) =>
    isFeatureConnectedToCoordinate(f, head)
  );
  const tailConnected = tailFeatures.some((f) =>
    isFeatureConnectedToCoordinate(f, tail)
  );

  return !(headConnected && tailConnected);
};
