import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";

type MultiPolygon = number[][][][];

export const isPointInsideMultiPolygon = (east: number, north: number, multipolygon: MultiPolygon) => {
  return new Polygon(multipolygon.flat()).intersectsCoordinate(new Point([east, north]).getCoordinates());
};
