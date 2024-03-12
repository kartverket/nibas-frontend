import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { PropertyEntry, GrenseArkiveringsEntry, GrenseTilhorighetEntry } from "contexts/HistoryContext/types";
import { FeatureProperties, KontekstEgenskaper } from "types/api";

export const getDateInFriendlyString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const updateFeatureWithNewProperties = (feature: Feature<LineString>, newProperties: FeatureProperties) => {
  feature.setProperties({
    ...newProperties,
  });
};

export const addFeaturePropertiesEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: PropertyEntry) => void,
  updatedFeatureProperties: FeatureProperties,
) => {
  const id = feature.getId()?.toString();

  if (!id) return;

  const oldFeatureProperties = feature.getProperties() as FeatureProperties;

  updateFeatureWithNewProperties(feature as Feature<LineString>, updatedFeatureProperties);

  addHistoryEntry({
    type: "property",
    changes: [
      {
        id: id,
        from: oldFeatureProperties,
        to: updatedFeatureProperties,
      },
    ],
  });
};

export const addPropertyEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: PropertyEntry) => void,
  updatedProperties: FeatureProperties,
) => {
  const id = feature.getId()?.toString();

  if (!id) return;

  const oldProperties = feature.getProperties() as FeatureProperties;

  updateFeatureWithNewProperties(feature as Feature<LineString>, updatedProperties);

  addHistoryEntry({
    type: "property",
    changes: [
      {
        id: id,
        from: oldProperties,
        to: feature.getProperties() as FeatureProperties,
      },
    ],
  });
};

export const addArchivingEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: GrenseArkiveringsEntry) => void,
) => {
  const id = feature.getId()?.toString();
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
        id: id,
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
  const id = feature.getId()?.toString();
  if (!id) return;

  const oldProperties = feature.getProperties() as FeatureProperties;
  const oldKontekstEgenskaper = oldProperties.kontekstEgenskaper;

  const newProperties: FeatureProperties = {
    ...oldProperties,
    kontekstEgenskaper: updatedKontekstEgenskaper,
  };
  feature.setProperties(newProperties);

  addHistoryEntry({
    type: "grensetilhorighetendring",
    changes: [
      {
        id: id,
        from: oldKontekstEgenskaper || ({} as KontekstEgenskaper),
        to: updatedKontekstEgenskaper,
      },
    ],
  });
};
