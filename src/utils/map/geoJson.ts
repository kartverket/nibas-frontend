import Feature from "ol/Feature";
import GeoJSON, {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
} from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import VectorSource from "ol/source/Vector";

const geoJson = new GeoJSON();

export const getFeaturesFromGeoJson = (
  json: GeoJSONFeature | GeoJSONFeatureCollection
) => {
  return geoJson.readFeatures(json, {
    dataProjection: "EPSG:25833",
  });
};

export const geoJsonToSource = (
  json: GeoJSONFeature | GeoJSONFeatureCollection
) => {
  return new VectorSource({
    features: getFeaturesFromGeoJson(json),
  });
};

export const featureToGeoJson = (feature: Feature<Geometry>): GeoJSONFeature =>
  geoJson.writeFeatureObject(feature, {
    dataProjection: "EPSG:25833",
  });
