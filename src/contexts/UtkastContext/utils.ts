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
  console.log("Utkast for entity", utkastForEntity);

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

  return featureCollection.features.reduce(
    (accumulator: GeoJSONFeature[], feature: GeoJSONFeature) => {
      // gå gjennom utkast-collectionene og finn det som berører current feature
      const featureCollectionWithUtkast = featuresSlice.find((collection) =>
        collection.features.find((f: GeoJSONFeature) => f.id === feature.id)
      );
      console.log(featureCollectionWithUtkast);

      if (!featureCollectionWithUtkast) {
        accumulator.push(feature);
        return accumulator;
      }

      // gå gjennom utkastet med endrede features og hent nye featuren
      const featureInUtkast = featureCollectionWithUtkast.features.find(
        (f: GeoJSONFeature) => f.id === feature.id
      );

      console.log("Feature in utkast", featureInUtkast);
      if (featureInUtkast) {
        accumulator.push(featureInUtkast);
      } else {
        accumulator.push(feature);
      }

      return accumulator;
    },
    []
  );
};

export const applyNonFeatureUtkast = <
  T extends UtkastResponse | UtkastResponse[]
>(
  entity: T,
  utkast: Utkast,
  type: EntityUtkastType
) => {
  const featuresSlice = utkast[type];

  if (!featuresSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretser") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    console.log("applying utkast to stemmekretsref array");
    return entity.map((e) => {
      const utkastForEntity = utkast[type]?.[e.id];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, featuresSlice));
  }

  return getCombinedEntity(entity, featuresSlice);
};

export const applyFeatureUtkast = (
  featureCollection: GeoJSONFeatureCollection,
  utkast: Utkast
) => {
  const featuresSlice = utkast.grenser;
  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  console.log("New feature collection with utkast applied", {
    ...featureCollection,
    features: newFeatures,
  });

  return {
    ...featureCollection,
    features: newFeatures,
  };
};
