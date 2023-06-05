import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { MetadataEntry } from "contexts/HistoryContext";
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

export const addMetadataEntryFromFeature = (
  feature: Feature<LineString>,
  addEntry: (entry: MetadataEntry) => void,
  updatedMetadata: Metadata
) => {
  const id = feature.getId();

  if (!id) return;

  const oldMetadata = feature.getProperties().metadata as Metadata;

  updateFeatureWithNewMetadata(feature as Feature<LineString>, updatedMetadata);

  addEntry({
    type: "metadata",
    changes: [
      {
        id: id as string,
        from: oldMetadata,
        to: feature.getProperties().metadata as Metadata,
      },
    ],
  });
};
