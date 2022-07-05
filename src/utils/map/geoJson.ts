import { FeatureLike } from "ol/Feature";
import GeoJSON, { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import { GeometryVectorSource } from "hooks/sources/types";

const geoJson = new GeoJSON();

export const sourceToGeoJson = (source: GeometryVectorSource | undefined) => {
  if (!source) return null;

  return geoJson.writeFeatures(source.getFeatures(), {
    dataProjection: "EPSG:25833",
  });
};

export const getFeaturesFromGeoJson = (json: string) => {
  return geoJson.readFeatures(json, {
    dataProjection: "EPSG:25833",
  });
};

export const geoJsonToSource = (json: string) => {
  return new VectorSource({
    features: getFeaturesFromGeoJson(json),
  });
};

export const featuresToGeoJson = (
  features: FeatureLike[]
): GeoJSONFeatureCollection => {
  return geoJson.writeFeaturesObject(features, {
    dataProjection: "EPSG:25833",
  });
};
