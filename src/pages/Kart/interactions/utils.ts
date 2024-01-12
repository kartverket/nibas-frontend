import { FeatureLike } from "ol/Feature";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";

export const coordinatesAreEqual = (a: Coordinate, b: Coordinate): boolean => {
  if (a && b) {
    return a.toString() === b.toString();
  }

  return false;
};

export const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

export const previousCoordinateKey = "previousCoordinates";
