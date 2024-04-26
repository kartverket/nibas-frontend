import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";

export const isPointInsideMultiPolygon = (east: number, north: number, multipolygon: number[][][][]) => {
  return new Polygon(multipolygon.flat()).intersectsCoordinate(new Point([east, north]).getCoordinates());
};
