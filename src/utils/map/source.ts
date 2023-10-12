import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";

export const addFeaturesToSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[],
  callback?: () => void,
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();
  if (!source) return;

  const newFeatures: Feature<Geometry>[] = [];

  features.forEach((feature) => {
    const id = feature.getId();

    if (!id) return;

    const existingFeature = source.getFeatureById(id);

    // oppdatere eksisterende feature hvis den finnes, så den ikke slettes
    // når nærliggende grense fjernes
    if (existingFeature) {
      const sharedIndex = existingFeature.get("sharedIndex") ?? 0;
      existingFeature.set("sharedIndex", sharedIndex + 1);
      return;
    }

    newFeatures.push(feature);
  });

  source.addFeatures(newFeatures);
  if (callback) callback();
};

export const removeFeaturesFromSourceByIds = (
  sourceId: LayerId,
  featureIds: string[],
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();
  if (!source) return;

  const removeFeature = (featureId: string) => {
    const featureToRemove = source.getFeatureById(featureId);

    if (!featureToRemove) return null;

    // hvis delt, ikke slett
    const sharedIndex = featureToRemove.get("sharedIndex");

    if (sharedIndex !== undefined && sharedIndex > 0) {
      featureToRemove.set("sharedIndex", sharedIndex - 1);
      return;
    }

    try {
      source.removeFeature(featureToRemove);
    } catch (error) {
      // ikke tryn når vi prøver å fjerne grense som allerede er fjernet
      // dette er en bug, grensen burde ikke ha vært fjernet
    }
  };

  featureIds.forEach(removeFeature);
};

export const getFeatureId = (feature: Feature<Geometry>) =>
  feature.getId()?.toString() ?? "";

export const getRepresentasjonspunktId = (entityId: string) =>
  `${entityId}-representasjonspunkt`;

export const getFlateId = (entityId: string) => `${entityId}-flate`;
