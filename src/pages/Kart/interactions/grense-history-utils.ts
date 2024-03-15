import { HistoryChange, MinimalGrense } from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { previousCoordinateKey } from "./constants";
import { GrenseType } from "hooks/layers/types";
import { FeatureProperties } from "types/api";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { getDefaultFeatureProperties } from "utils/features";

export const createGrenseHistoryChange = (features: Feature[], grenseType?: GrenseType) => {
  const changes: HistoryChange<MinimalGrense>[] = [];

  features.forEach((feature) => {
    if (feature instanceof Feature) {
      const geometry = feature.getGeometry();

      // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
      if (geometry instanceof LineString) {
        const featureId = feature.getId()?.toString();
        if (featureId === undefined) return;

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
        const featureId = feature.getId()?.toString();

        if (featureId === undefined || !grenseDiscriminator) continue;

        const defaultFeatureProperties = getDefaultFeatureProperties(grenseType);
        if (!defaultFeatureProperties) continue;

        const fromChange: MinimalGrense & FeatureProperties = {
          ...defaultFeatureProperties,
          coordinates: [],
          type: grenseType,
        };
        const toChange: MinimalGrense & FeatureProperties = {
          ...defaultFeatureProperties,
          coordinates: geometry.getCoordinates(),
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
