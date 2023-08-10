import { initialMapCenter, initialMapZoom, map } from "pages/Kart/constants";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";

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

  return layers.flatMap((l) => {
    const source = l.getSource();
    if (source instanceof VectorSource) {
      return source.getFeatures();
    }
    return [];
  });
};

export const getEditMode = (
  isEditing: boolean,
  hasEditingInMap: boolean
): "edit" | "view" | null => {
  if (isEditing) {
    return "edit";
  }

  if (hasEditingInMap) {
    return null;
  }

  return "view";
};
