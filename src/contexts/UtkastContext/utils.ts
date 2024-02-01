import { Feature } from "ol";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import LineString from "ol/geom/LineString";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import {
  GrunnkretsEntry,
  HistoryState,
  StemmekretsEntry,
  StemmekretsSammenslaaingsendringEntry,
} from "contexts/HistoryContext";
import { editSource } from "hooks/layers/constants";
import {
  FylkeRequest,
  GrunnkretsRequest,
  KommuneRequest,
  NasjonRequest,
  StemmekretsRef,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
  UtkastGrenseendringer,
  UtkastMetadataendringer,
  UtkastOperasjoner,
  UtkastResponse,
} from "types/api";
import { featureToGeoJson } from "utils/map/geoJson";
import { getIdFromEntity } from "utils/api";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";

const getCombinedEntity = <T extends ResponseWithId>(
  entity: T,
  utkastSlice: NonNullable<NonNullable<UtkastMetadataendringer>[EntityUtkastType]>,
) => {
  const utkastForEntity = utkastSlice[getIdFromEntity(entity)];

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const getCombinedFeatures = (
  featureCollection: GeoJSONFeatureCollection,
  featuresSlice: NonNullable<UtkastGrenseendringer["endredeFeatures"]>,
) => {
  const updatedFeaturesFromCollection = featureCollection.features.map(
    (feature: GeoJSONFeature) => featuresSlice.find((f) => f.id === feature.id) ?? feature,
  );

  const newFeatures = featuresSlice.filter((f) => isTempFeatureId(f.id as string));

  return updatedFeaturesFromCollection.concat(newFeatures);
};

export const applyNonFeatureUtkast = <T extends NonNullable<UtkastEntity>>(
  entity: T,
  utkast: UtkastResponse,
  type: EntityUtkastType,
) => {
  const utkastSlice = utkast.operasjoner.metadataendringer?.[type];

  if (!utkastSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretsendringer") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    return entity.map((e) => {
      const utkastForEntity = utkast.operasjoner.metadataendringer?.[type]?.[getIdFromEntity(e)];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn ?? (e as StemmekretsRef).navn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, utkastSlice));
  }

  return getCombinedEntity(entity, utkastSlice);
};

export const applyFeatureUtkast = (featureCollection: GeoJSONFeatureCollection, utkast: UtkastResponse) => {
  const featuresSlice = utkast.operasjoner.grenseendringer?.endredeFeatures;

  if (!featuresSlice) return featureCollection;

  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  return {
    ...featureCollection,
    features: newFeatures,
  };
};

const reduceMetadataOperations = (utkastOperations: UtkastOperasjoner, entry: GrunnkretsEntry | StemmekretsEntry) => {
  switch (entry.type) {
    case "grunnkrets": {
      return addKretsChangeToOperations(utkastOperations, entry, "grunnkretsendringer");
    }
    case "stemmekrets": {
      return addKretsChangeToOperations(utkastOperations, entry, "stemmekretsendringer");
    }
  }
};

//Antas at det bare er en entry i changes
const reduceStemmekretssammenslaingsOperations = (
  operations: StemmekretsSammenslaaingsendringRequest,
  entry: StemmekretsSammenslaaingsendringEntry,
): StemmekretsSammenslaaingsendringRequest => {
  entry.changes.forEach((change) => {
    if (!change.to) return operations;

    operations = change.to;
  });
  return operations;
};

const addKretsChangeToOperations = (
  operations: UtkastOperasjoner,
  entry: GrunnkretsEntry | StemmekretsEntry,
  endringerKey: "grunnkretsendringer" | "stemmekretsendringer",
) => {
  entry.changes.forEach((change) => {
    if (change.to && operations.metadataendringer[endringerKey]) {
      operations.metadataendringer[endringerKey][change.id] = change.to;
    }
  });

  return operations;
};

export const historyToUtkastOperations = (history: HistoryState, previousUtkast?: UtkastResponse) => {
  const historyToCurrentIndex = history.entries.slice(0, history.index);

  // hent endringer på enheter og gjør endringene om til utkastoperasjoner
  const utkastOperations = (
    historyToCurrentIndex.filter((entry) => entry.type === "stemmekrets" || entry.type === "grunnkrets") as (
      | GrunnkretsEntry
      | StemmekretsEntry
    )[]
  ).reduce(
    reduceMetadataOperations,
    createUtkastOperations({
      ...{
        ...previousUtkast?.operasjoner.grenseendringer,
        ...previousUtkast?.operasjoner.metadataendringer,
        stemmekretssammenslaaingsendringer: previousUtkast?.operasjoner.stemmekretsSammenslaaingsendring,
      },
    }),
  ) as UtkastOperasjoner;

  const sammenslaaingsOperations = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "stemmekretssammenslaaingsendring",
    ) as StemmekretsSammenslaaingsendringEntry[]
  ).reduce(reduceStemmekretssammenslaingsOperations, {} as StemmekretsSammenslaaingsendringRequest);

  //Antar her at det bare er en sammenslåing per utkast
  if (Object.keys(sammenslaaingsOperations).length > 0) {
    utkastOperations.stemmekretsSammenslaaingsendring = sammenslaaingsOperations;
  }

  const editedFeatureHistoryEntries = [
    "grense",
    "metadata",
    "grensearkivering",
    "grensetilhorighetendring",
    "nygrense",
  ];

  const relevantHistoryEntries = historyToCurrentIndex.filter((entry) =>
    editedFeatureHistoryEntries.includes(entry.type),
  );

  // hent grenseendringer og gjør endringene om til en liste av features
  const editedFeatures: GeoJSONFeature[] = utkastOperations.grenseendringer.endredeFeatures;

  relevantHistoryEntries.forEach((entry) => {
    entry.changes.forEach((change) => {
      if (!change.to) return;

      const feature = editSource.getFeatureById(change.id) as Feature<LineString>;

      if (!feature) return;

      const featureAsGeoJson = featureToGeoJson(feature);

      const index = editedFeatures.findIndex((geoJsonFeature) => featureAsGeoJson.id === geoJsonFeature.id);

      // Hvis vi allerede har lagt inn featuren tidligere i historikken,
      // ønsker vi å overskrive den hvis den samme featuren endres senere i historikken
      if (index >= 0) {
        editedFeatures[index] = featureAsGeoJson;
        return;
      }

      editedFeatures.push(featureAsGeoJson);
    });
  });

  utkastOperations.grenseendringer = {
    endredeFeatures: editedFeatures,
  };

  return utkastOperations;
};

export const createUtkastOperations = ({
  endredeFeatures = [],
  fylkesendringer = {},
  grunnkretsendringer = {},
  kommuneendringer = {},
  nasjonsendringer = {},
  stemmekretsendringer = {},
  stemmekretssammenslaaingsendringer,
}: {
  endredeFeatures?: GeoJSONFeature[];
  fylkesendringer?: Record<string, FylkeRequest>;
  grunnkretsendringer?: Record<string, GrunnkretsRequest>;
  kommuneendringer?: Record<string, KommuneRequest>;
  nasjonsendringer?: Record<string, NasjonRequest>;
  stemmekretsendringer?: Record<string, StemmekretsRequest>;
  stemmekretssammenslaaingsendringer?: StemmekretsSammenslaaingsendringRequest;
}): UtkastOperasjoner => ({
  grenseendringer: {
    endredeFeatures,
  },
  metadataendringer: {
    fylkesendringer,
    grunnkretsendringer,
    kommuneendringer,
    nasjonsendringer,
    stemmekretsendringer,
  },
  stemmekretsSammenslaaingsendring: stemmekretssammenslaaingsendringer,
});
