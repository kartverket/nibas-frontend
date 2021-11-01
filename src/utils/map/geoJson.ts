import { GeometryVectorSource } from "hooks/sources/types";
import { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";

const geoJson = new GeoJSON();

export const sourceToGeoJson = (source: GeometryVectorSource | undefined) => {
  if (!source) return null;

  return geoJson.writeFeatures(source.getFeatures() ?? [], {
    dataProjection: "EPSG:25833",
  });
};

export const geoJsonToSource = (json: string) => {
  return new VectorSource({
    features: geoJson.readFeatures(json, {
      dataProjection: "EPSG:25833",
    }),
  });
};

export const featuresToGeoJson = (features: FeatureLike[]) => {
  return JSON.stringify(
    geoJson.writeFeaturesObject(features, {
      dataProjection: "EPSG:25833",
    })
  );
};
