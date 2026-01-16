import {
  GrenseTilhorighetEntry,
  HistoryChange,
  NyGrenseDeleteEntry,
  PropertyEntry,
} from "contexts/HistoryContext/types";
import { isDate } from "date-fns";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import LineString from "ol/geom/LineString";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { FeatureProperties, KontekstEgenskaper } from "types/api";
import { isFeatureMetadataEditable, isFeatureToBeArchived } from "utils/features";
import { removeNil } from "utils/list-utils";

export const isGrenseinformasjonPanelDisabled = (feature: Feature | undefined) => {
  if (feature) {
    // Nye grenser skal alltid kunne redigeres
    if (isTempFeatureId(feature.getId()?.toString())) {
      return false;
    }

    const isMetadataEditable = isFeatureMetadataEditable(feature, isFeatureToBeArchived(feature));

    if (!isMetadataEditable) {
      return true;
    }

    const isFeatureInEditLayer = editSource
      .getFeatures()
      .some((editFeature) => editFeature.getId() === feature.getId());

    return !isFeatureInEditLayer;
  }
  return true;
};

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

export const addGrenseDeleteEntryFromFeatureList = (
  features: Feature<Geometry>[],
  addHistoryEntry: (entry: NyGrenseDeleteEntry) => void,
) => {
  const deleteFeaturesChanges = removeNil(
    features.map((feature) => {
      const id = feature.getId()?.toString();
      if (id == null) {
        return;
      }
      const change: HistoryChange<Feature<Geometry> | null> = {
        id: id,
        from: feature,
        to: null,
      };
      return change;
    }),
  );
  addHistoryEntry({
    type: "grensedelete",
    changes: deleteFeaturesChanges,
  });
};

export const addKontekstEntryFromFeature = (
  feature: Feature<LineString>,
  newKontekstEgenskaper: KontekstEgenskaper[],
  addHistoryEntry: (entry: GrenseTilhorighetEntry) => void,
) => {
  const id = feature.getId()?.toString();
  if (id == null) {
    return;
  }

  const oldProperties = feature.getProperties() as FeatureProperties;
  const oldKontekstEgenskaper = oldProperties.kontekstEgenskaper;

  const newKonteksterType = new Set(newKontekstEgenskaper.map((ke) => ke.type));

  if (newKonteksterType.size !== 1) {
    throw new Error("Kan kun endre én type krets når man setter kontekstegenskaper");
  }

  // Vi erstatter kun den kretstypen som settes i newKontekstEgenskaper.
  const updatedKontekstEgenskaper = oldKontekstEgenskaper
    .filter((ke) => !newKonteksterType.has(ke.type))
    .concat(newKontekstEgenskaper);

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
