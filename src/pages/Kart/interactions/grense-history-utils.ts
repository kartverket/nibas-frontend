import { HistoryChange, MinimalGrense, NyGrense } from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { previousCoordinateKey } from "./constants";
import { GrenseType } from "hooks/layers/types";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { getDefaultFeatureProperties } from "utils/features";
import { SplittedFeature } from "./useSplit";

export const createGrenseHistoryChange = (features: Feature[], grenseType?: GrenseType) => {
  const changes: HistoryChange<MinimalGrense>[] = [];

  features.forEach((feature) => {
    // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
    const geometry = feature.getGeometry();
    if (geometry instanceof LineString) {
      const featureId = feature.getId()?.toString();
      if (featureId === undefined) {
        return;
      }

      changes.push({
        id: featureId,
        from: {
          coordinates: feature.get(previousCoordinateKey) ?? [],
          type: grenseType,
        },
        to: { coordinates: geometry.getCoordinates(), type: grenseType },
      });
      feature.unset(previousCoordinateKey);
    }
  });

  return changes;
};

export const createNyGrenseHistoryChange = (
  feature: Feature,
  grenseType: GrenseType,
  splittedFeatures: SplittedFeature[],
) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof LineString) {
    const grenseDiscriminator = getMetadataDiscriminatorFromType(grenseType);

    const featureId = feature.getId()?.toString();
    if (featureId === undefined || !grenseDiscriminator) {
      return null;
    }

    const defaultFeatureProperties = getDefaultFeatureProperties(grenseType);
    if (!defaultFeatureProperties) {
      return null;
    }

    const fromChange: NyGrense = {
      ...defaultFeatureProperties,
      coordinates: [],
      type: grenseType,
      grensedeling: [...splittedFeatures.map((f) => f.oldFeature)],
    };
    const toChange: NyGrense = {
      ...defaultFeatureProperties,
      coordinates: geometry.getCoordinates(),
      type: grenseType,
      grensedeling: [...splittedFeatures.flatMap((f) => f.newFeatures)],
    };

    feature.unset(previousCoordinateKey);
    return {
      id: featureId,
      from: fromChange,
      to: toChange,
    };
  }

  return null;
};
