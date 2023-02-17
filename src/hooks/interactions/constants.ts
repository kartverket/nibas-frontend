import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import RenderFeature from "ol/render/Feature";

export const pixelTolerance = 20;

export const isNewFeature = (feature: Feature<Geometry> | RenderFeature) => {
  const featureId = feature.getId() as string;
  return featureId.startsWith("temp");
};
