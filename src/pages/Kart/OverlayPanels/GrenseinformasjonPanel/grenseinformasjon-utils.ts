import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import {
  PropertyEntry,
  GrenseArkiveringsEntry,
  GrenseTilhorighetEntry,
  HistoryChange,
} from "contexts/HistoryContext/types";
import { FeatureProperties, KontekstEgenskaper } from "types/api";
import { removeNil } from "utils/list-utils";
import { isDate } from "date-fns";

export const datestringToFormattedDatestring = (dateString: string) => {
  const date = new Date(dateString);

  return dateToFormattedDatestring(date);
};

export const dateToFormattedDatestring = (date: Date): string | undefined => {
  if (isDate(date) && !isNaN(date.getTime())) {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }
};

const updateFeatureWithNewProperties = (feature: Feature<LineString>, newProperties: FeatureProperties) => {
  feature.setProperties({
    ...newProperties,
  });
};

/** Fjerner OL-egenskaper som ikke er med i vår FeatureProperties-DTO **/
const extractPropertiesFromOLProperties = (olProperties: FeatureProperties) => ({
  type: olProperties.type,
  srid: olProperties.srid,
  metadata: olProperties.metadata,
  kontekstEgenskaper: olProperties.kontekstEgenskaper,
  version: olProperties.version,
  shouldArchive: olProperties.shouldArchive,
  inndelingerKontekst: olProperties.inndelingerKontekst,
});

export const addFeaturePropertiesEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: PropertyEntry) => void,
  updatedFeatureProperties: FeatureProperties,
) => {
  const id = feature.getId()?.toString();
  if (id == null) {
    return;
  }

  const oldFeatureProperties = feature.getProperties() as FeatureProperties;

  updateFeatureWithNewProperties(feature as Feature<LineString>, updatedFeatureProperties);
  addHistoryEntry({
    type: "property",
    changes: [
      {
        id: id,
        from: extractPropertiesFromOLProperties(oldFeatureProperties),
        to: extractPropertiesFromOLProperties(updatedFeatureProperties),
      },
    ],
  });
};

export const addArchivingEntryFromFeatureList = (
  features: Feature<LineString>[],
  addHistoryEntry: (entry: GrenseArkiveringsEntry) => void,
) => {
  const changeEntries: HistoryChange<FeatureProperties>[] = removeNil(
    features.map((feature) => {
      const id = feature.getId()?.toString();
      if (id == null) {
        return;
      }

      const oldProperties = feature.getProperties() as FeatureProperties;
      const newProperties: FeatureProperties = {
        ...oldProperties,
        shouldArchive: true,
      };
      feature.setProperties(newProperties);

      return {
        id: id,
        from: oldProperties,
        to: newProperties,
      };
    }),
  );

  addHistoryEntry({
    type: "grensearkivering",
    changes: changeEntries,
  });
};

export const addKontekstEntryFromFeature = (
  feature: Feature<LineString>,
  updatedKontekstEgenskaper: KontekstEgenskaper[],
  addHistoryEntry: (entry: GrenseTilhorighetEntry) => void,
) => {
  const id = feature.getId()?.toString();
  if (id == null) {
    return;
  }

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
        from: oldKontekstEgenskaper ?? ({} as KontekstEgenskaper),
        to: updatedKontekstEgenskaper,
      },
    ],
  });
};
