import { initialMapCenter, initialMapZoom, map } from "pages/Kart/constants";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { pixelTolerance } from "pages/Kart/interactions/constants";

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

    if (!featureExtent) {
      return acc;
    }

    if (!acc) {
      return [featureExtent[0], featureExtent[1], featureExtent[2], featureExtent[3]];
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

  if (!extent) {
    return;
  }

  const view = map.getView();
  view.fit(extent, {
    padding: [100, 100, 200, 100],
    duration: 750,
  });
};

/** Euklidisk avstand mellom to koordinater i piksler */
const pixelDistance = (coord1: Coordinate, coord2: Coordinate) => {
  const pixel1 = map.getPixelFromCoordinate(coord1);
  const pixel2 = map.getPixelFromCoordinate(coord2);
  const dx = pixel1[0] - pixel2[0];
  const dy = pixel1[1] - pixel2[1];
  const squaredPixelDistance = dx * dx + dy * dy;
  return Math.sqrt(squaredPixelDistance);
};

export const findNearbyVertexOnFeature = (lineString: LineString, coordinate: Coordinate): Coordinate | null => {
  const coordinates = lineString.getCoordinates();

  const coordinatesWithDistanceToClick = coordinates
    .map((coord) => ({
      coordinates: coord,
      distance: pixelDistance(coord, coordinate),
    }))
    .filter((cwd) => cwd.distance < pixelTolerance);

  // Hvis punktet ikke er innenfor pikseltoleransen sier vi at brukeren ikke trukket på et punkt på grensen
  if (coordinatesWithDistanceToClick.length === 0) {
    return null;
  }

  const nearestVertexCoordinate = coordinatesWithDistanceToClick
    .sort((a, b) => a.distance - b.distance)
    .map((cwd) => cwd.coordinates)[0];
  return nearestVertexCoordinate;
};
