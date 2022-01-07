import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";
import { GeometryVectorSource } from "hooks/sources/types";

const geoJson = new GeoJSON();

export const sourceToGeoJson = (source: GeometryVectorSource | undefined) => {
  if (!source) return null;

  return geoJson.writeFeatures(source.getFeatures(), {
    dataProjection: "EPSG:25833",
  });
};

export const getFeaturesFromGeoJson = (json: string | Feature<Geometry>) => {
  return geoJson.readFeatures(json, {
    dataProjection: "EPSG:25833",
  });
};

export const geoJsonToSource = (json: string | Feature<Geometry>) => {
  return new VectorSource({
    features: getFeaturesFromGeoJson(json),
  });
};

export const featuresToGeoJson = (features: FeatureLike[]) => {
  return JSON.stringify(
    geoJson.writeFeaturesObject(features, {
      dataProjection: "EPSG:25833",
    })
  );
};
