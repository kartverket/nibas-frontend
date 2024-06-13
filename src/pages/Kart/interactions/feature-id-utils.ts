// OpenLayers demands an ID for all features, and when drawing features

import { Feature } from "ol";
import { Geometry } from "ol/geom";

// we need to give the feature some temporary ID. For a temporary id a counter should be just fine
let idCounter: number = 1000;
const tempIdPrefix = "temp-feature-id";

export const getTempFeatureId = (): string => {
  return `${tempIdPrefix}-${Date.now()}-${idCounter++}`;
};

export const isTempFeatureId = (id: string | number | null | undefined): boolean => {
  if (typeof id === "string" && id.length > 0) {
    return id.includes(tempIdPrefix);
  }

  return false;
};

export const isNonEditableFeatureId = (id: string | number | null | undefined): boolean => {
  return id?.toString().includes("_isViewing") ?? false;
};

export const getNonEditableFeatureId = (feature: Feature<Geometry>) => {
  return feature.getId()?.toString().replace("_isViewing", "");
};
