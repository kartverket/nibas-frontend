import { GeoJSONGeometry } from "ol/format/GeoJSON";
import { Point } from "./api";

export const isPoint = (geometry: GeoJSONGeometry): geometry is Point => {
  return geometry.type === "Point";
};
