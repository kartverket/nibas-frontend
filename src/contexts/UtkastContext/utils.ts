import { Feature } from "ol";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import LineString from "ol/geom/LineString";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import {
  GrenseEntry,
  GrunnkretsEntry,
  MetadataEntry,
  StemmekretsEntry,
  ToolbarHistory,
} from "contexts/ToolbarContext";
import { editSource } from "hooks/layers/constants";
import {
  UtkastGrenseendringer,
  UtkastMetadataendringer,
  UtkastOperasjoner,
  UtkastResponse,
} from "types/api";
import { featuresToGeoJson } from "utils/map/geoJson";

const getCombinedEntity = <T extends ResponseWithId>(
  entity: T,
  utkastSlice: NonNullable<
    NonNullable<UtkastMetadataendringer>[EntityUtkastType]
  >
) => {
  const utkastForEntity = utkastSlice[entity.id];

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const getCombinedFeatures = (
  featureCollection: GeoJSONFeatureCollection,
  featuresSlice: NonNullable<UtkastGrenseendringer["endredeFeatures"]>
) => {
  return featureCollection.features.map((feature: GeoJSONFeature) => {
    // denne finner bare første lagring hvor featuren er endret
    // dette funker hvis vi fjerner gamle versjoner av endrede features
    // på lagring
    const featureCollectionWithUtkast = featuresSlice.find((collection) =>
      collection.features.find((f: GeoJSONFeature) => f.id === feature.id)
    );

    if (!featureCollectionWithUtkast) {
      return feature;
    }

    // gå gjennom utkastet med endrede features og hent nye featuren
    const featureInUtkast = featureCollectionWithUtkast.features.find(
      (f: GeoJSONFeature) => f.id === feature.id
    );

    if (featureInUtkast) {
      return featureInUtkast;
    } else {
      return feature;
    }
  });
};

export const applyNonFeatureUtkast = <T extends NonNullable<UtkastEntity>>(
  entity: T,
  utkast: UtkastResponse,
  type: EntityUtkastType
) => {
  const utkastSlice = utkast.operasjoner.metadataendringer?.[type];

  if (!utkastSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretsendringer") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    return entity.map((e) => {
      const utkastForEntity =
        utkast.operasjoner.metadataendringer?.[type]?.[e.id];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, utkastSlice));
  }

  return getCombinedEntity(entity, utkastSlice);
};

export const applyFeatureUtkast = (
  featureCollection: GeoJSONFeatureCollection,
  utkast: UtkastResponse
) => {
  const featuresSlice = utkast.operasjoner.grenseendringer?.endredeFeatures;

  if (!featuresSlice) return featureCollection;

  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  return {
    ...featureCollection,
    features: newFeatures,
  };
};

const reduceMetadataOperations = (
  utkastOperations: UtkastOperasjoner,
  entry: GrunnkretsEntry | StemmekretsEntry
) => {
  switch (entry.type) {
    case "grunnkrets": {
      return addKretsChangeToOperations(
        utkastOperations,
        entry,
        "grunnkretsendringer"
      );
    }
    case "stemmekrets": {
      return addKretsChangeToOperations(
        utkastOperations,
        entry,
        "stemmekretsendringer"
      );
    }
  }
};

const reduceGrenseOperations = (
  editedFeatures: Feature<LineString>[],
  entry: GrenseEntry | MetadataEntry
) => {
  entry.changes.forEach((change) => {
    if (!change.to) return editedFeatures;

    const feature = editSource.getFeatureById(change.id) as Feature<LineString>;

    editedFeatures.push(feature);
  });

  return editedFeatures;
};

const addKretsChangeToOperations = (
  operations: UtkastOperasjoner,
  entry: GrunnkretsEntry | StemmekretsEntry,
  endringerKey: "grunnkretsendringer" | "stemmekretsendringer"
) => {
  if (!operations.metadataendringer?.[endringerKey]) {
    operations.metadataendringer = {
      ...operations.metadataendringer,
      [endringerKey]: {},
    };
  }

  entry.changes.forEach((change) => {
    if (change.to && operations.metadataendringer?.[endringerKey]) {
      // vi legger til keyen i steget over, så dette er safe
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      operations.metadataendringer[endringerKey]![change.id] = change.to;
    }
  });

  return operations;
};

export const historyToUtkastOperations = (
  history: ToolbarHistory,
  previousUtkast?: UtkastResponse
) => {
  const historyToCurrentIndex = history.entries.slice(0, history.index);

  // hent grenseendringer og gjør endringene om til en liste av features
  const editedFeatures = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "grense" || entry.type === "metadata"
    ) as (GrenseEntry | MetadataEntry)[]
  ).reduce(reduceGrenseOperations, [] as Feature<LineString>[]);

  // hent endringer på enheter og gjør endringene om til utkastoperasjoner
  const utkastOperations = (
    historyToCurrentIndex.filter(
      (entry) => entry.type !== "grense" && entry.type !== "metadata"
    ) as (GrunnkretsEntry | StemmekretsEntry)[]
  ).reduce(reduceMetadataOperations, {
    metadataendringer: {},
    grenseendringer: {},
    ...(previousUtkast?.operasjoner ?? {}),
  } as UtkastOperasjoner);

  // hvis det er noen endringer, slå sammen tidligere endringer og nye endringer til ny liste
  if (editedFeatures.length > 0) {
    utkastOperations.grenseendringer = {
      endredeFeatures: ([] as GeoJSONFeatureCollection[]).concat(
        previousUtkast?.operasjoner.grenseendringer?.endredeFeatures ?? [],
        featuresToGeoJson(editedFeatures)
      ),
    };
  }

  return utkastOperations;
};
