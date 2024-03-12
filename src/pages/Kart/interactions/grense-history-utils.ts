import { HistoryChange, MinimalGrense } from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { LineString } from "ol/geom";
import { previousCoordinateKey } from "./constants";
import { GrenseType } from "hooks/layers/types";
import { FeatureProperties } from "types/api";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { getDefaultFeatureProperties } from "utils/features";

export const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId()?.toString();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

export const createGrenseHistoryChange = (features: Feature[], grenseType?: GrenseType) => {
  const changes: HistoryChange<MinimalGrense>[] = [];

  features.forEach((feature) => {
    if (feature instanceof Feature) {
      const geometry = feature.getGeometry();

      // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
      if (geometry instanceof LineString) {
        const { coordinates, featureId } = getInfoFromFeature(feature);

        if (!coordinates || !featureId) return;
        changes.push({
          id: featureId,
          from: {
            coordinates: feature.get(previousCoordinateKey) || [],
            type: grenseType,
          },
          to: { coordinates, type: grenseType },
        });
        feature.unset(previousCoordinateKey);
      }
    }
  });

  return changes;
};

export const createNyGrenseHistoryChanges = (features: Feature[], grenseType: GrenseType) => {
  const changes: HistoryChange<MinimalGrense & FeatureProperties>[] = [];

  for (const feature of features) {
    if (feature instanceof Feature) {
      const geometry = feature.getGeometry();
      const grenseDiscriminator = getMetadataDiscriminatorFromType(grenseType);

      if (geometry instanceof LineString) {
        const { coordinates, featureId } = getInfoFromFeature(feature);
        if (!coordinates || !featureId || !grenseDiscriminator) continue;

        const defaultFeatureProperties = getDefaultFeatureProperties(grenseType);
        if (!defaultFeatureProperties) continue;

        const fromChange: MinimalGrense & FeatureProperties = {
          ...defaultFeatureProperties,
          coordinates: [],
          type: grenseType,
        };
        const toChange: MinimalGrense & FeatureProperties = {
          ...defaultFeatureProperties,
          coordinates: coordinates,
          type: grenseType,
        };

        changes.push({
          id: featureId,
          from: fromChange,
          to: toChange,
        });

        feature.unset(previousCoordinateKey);
      }
    }
  }

  return changes;
};
