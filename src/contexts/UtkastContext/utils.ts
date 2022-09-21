import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import {
  UtkastGrenseendringer,
  UtkastMetadataendringer,
  UtkastResponse,
} from "types/api";

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
