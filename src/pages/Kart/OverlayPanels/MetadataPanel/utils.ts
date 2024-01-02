import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { GrenseArkiveringsEntry, GrenseTilhorighetEntry, MetadataEntry } from "contexts/HistoryContext";
import { FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";

export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const updateFeatureWithNewMetadata = (
  feature: Feature<LineString>,
  newMetadata: Metadata,
) => {
  const properties = feature.getProperties() as FeatureProperties;
  feature.setProperties({
    ...properties,
    metadata: newMetadata,
  });
};

export const addMetadataEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: MetadataEntry) => void,
  updatedMetadata: Metadata,
) => {
  const id = feature.getId();

  if (!id) return;

  const oldMetadata = feature.getProperties().metadata as Metadata;

  updateFeatureWithNewMetadata(feature as Feature<LineString>, updatedMetadata);

  addHistoryEntry({
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

export const addArchivingEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: GrenseArkiveringsEntry) => void,
) => {
  const id = feature.getId();
  if (!id) return;

  const oldProperties = feature.getProperties() as FeatureProperties;
  const newProperties: FeatureProperties = {
    ...oldProperties,
    shouldArchive: true,
  };
  feature.setProperties(newProperties);

  addHistoryEntry({
    type: "grensearkivering",
    changes: [
      {
        id: id as string,
        from: oldProperties,
        to: newProperties,
      },
    ],
  });
};

export const addKontekstEntryFromFeature = (
  feature: Feature<LineString>,
  updatedKontekstEgenskaper: KontekstEgenskaper[],
  addHistoryEntry: (entry: GrenseTilhorighetEntry) => void,
) => {
  const id = feature.getId();
  if (!id) return;

  const oldProperties = feature.getProperties() as FeatureProperties;
  const newProperties: FeatureProperties = {
    ...oldProperties,
    kontekstEgenskaper: updatedKontekstEgenskaper,
  };
  feature.setProperties(newProperties);

  addHistoryEntry({
    type: "grensetilhorighetendring",
    changes: [
      {
        id: id as string,
        from: oldProperties,
        to: newProperties,
      },
    ],
  });
};
