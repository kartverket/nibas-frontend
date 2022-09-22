import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import { ToolbarHistory } from "contexts/ToolbarContext";
import {
  UtkastGrenseendringer,
  UtkastMetadataendringer,
  UtkastOperasjoner,
  UtkastResponse,
} from "types/api";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
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

export const historyToUtkastOperations = (
  history: ToolbarHistory,
  previousUtkast?: UtkastResponse
) => {
  console.log(history);
  const utkastOperations: UtkastOperasjoner = {
    metadataendringer: {},
    grenseendringer: {},
    ...(previousUtkast?.operasjoner ?? {}),
  };

  const mutateUrls: string[] = [];
  const editedFeatures: Feature<LineString>[] = [];

  history.entries.forEach((entry) => {
    switch (entry.type) {
      case "grunnkrets": {
        if (!utkastOperations.metadataendringer?.grunnkretsendringer) {
          utkastOperations.metadataendringer = {
            ...utkastOperations.metadataendringer,
            grunnkretsendringer: {},
          };
        }

        mutateUrls.push(entry.kommuneId);

        entry.changes.forEach((change) => {
          if (
            !change.to ||
            !utkastOperations.metadataendringer?.grunnkretsendringer
          )
            return;

          utkastOperations.metadataendringer.grunnkretsendringer[change.id] =
            change.to;
        });
        break;
      }
      case "stemmekrets": {
        if (!utkastOperations.metadataendringer?.stemmekretsendringer) {
          utkastOperations.metadataendringer = {
            ...utkastOperations.metadataendringer,
            stemmekretsendringer: {},
          };
        }

        mutateUrls.push(entry.kommuneId);

        entry.changes.forEach((change) => {
          if (
            !change.to ||
            !utkastOperations.metadataendringer?.stemmekretsendringer
          )
            return;

          utkastOperations.metadataendringer.stemmekretsendringer[change.id] =
            change.to;
        });
        break;
      }
      case "grense":
      case "metadata": {
        entry.changes.forEach((change) => {
          if (!change.to) return;

          const feature = editSource.getFeatureById(
            change.id
          ) as Feature<LineString>;

          editedFeatures.push(feature);
        });
        break;
      }
    }
  });

  if (!utkastOperations.grenseendringer && editedFeatures.length > 0) {
    utkastOperations.grenseendringer = {
      endredeFeatures: ([] as GeoJSONFeatureCollection[]).concat(
        previousUtkast?.operasjoner.grenseendringer?.endredeFeatures ?? [],
        featuresToGeoJson(editedFeatures)
      ),
    };
  }

  console.log("Created utkast operations", utkastOperations);

  return utkastOperations;
};
