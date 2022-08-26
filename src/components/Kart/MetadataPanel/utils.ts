import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { FeatureProperties, Metadata } from "types/api";

export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export const updateFeatureWithNewMetadata = (
  feature: Feature<LineString>,
  newMetadata: Metadata
) => {
  const properties = feature.getProperties() as FeatureProperties;
  feature.setProperties({
    ...properties,
    metadata: newMetadata,
  });
};
