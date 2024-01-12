import { HistoryChange } from "contexts/HistoryContext";
import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { LineString } from "ol/geom";
import { previousCoordinateKey } from "./constants";

export const getInfoFromFeature = (featureLike: FeatureLike) => {
  const featureId = featureLike.getId();
  const geometry = featureLike.getGeometry() as LineString;
  return { coordinates: geometry.getCoordinates(), featureId };
};

export const createHistoryEntryForFeatures = (features: Feature[]) => {
  const changes: HistoryChange<number[][]>[] = [];

  features.forEach((feature) => {
    if (feature instanceof Feature) {
      const geometry = feature.getGeometry();

      // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
      if (geometry instanceof LineString) {
        const { coordinates, featureId } = getInfoFromFeature(feature);

        if (!coordinates || !featureId) return;
        changes.push({
          id: featureId as string,
          from: feature.get(previousCoordinateKey),
          to: coordinates,
        });
        feature.unset(previousCoordinateKey);
      }
    }
  });

  return changes;
};
