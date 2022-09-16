import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import {
  EntityUtkastType,
  FeatureUtkastType,
  Utkast,
  UtkastResponse,
} from "./types";

const getCombinedEntity = <T extends UtkastResponse>(
  entity: T,
  utkastSlice: Utkast[EntityUtkastType]
) => {
  if (!utkastSlice) return entity;

  const utkastForEntity = utkastSlice[entity.id];

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const getCombinedFeatures = (
  featureCollection: GeoJSONFeatureCollection,
  featuresSlice: Utkast[FeatureUtkastType]
) => {
  if (!featuresSlice) return featureCollection.features;

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

export const applyNonFeatureUtkast = <
  T extends UtkastResponse | UtkastResponse[]
>(
  entity: T,
  utkast: Utkast,
  type: EntityUtkastType
) => {
  const utkastSlice = utkast[type];

  if (!utkastSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretser") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    return entity.map((e) => {
      const utkastForEntity = utkast[type]?.[e.id];

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
  utkast: Utkast
) => {
  const featuresSlice = utkast.grenser;
  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  return {
    ...featureCollection,
    features: newFeatures,
  };
};
