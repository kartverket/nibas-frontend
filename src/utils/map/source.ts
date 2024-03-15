import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import VectorSource from "ol/source/Vector";
import { FeatureProperties } from "../../types/api";

export const addEditedFeaturesToSource = (features: Feature<Geometry>[], callback?: () => void) => {
  const editedFeatured = features.filter((f) => !(f.getProperties() as FeatureProperties).shouldArchive);
  const archivedFeatures = features.filter((f) => (f.getProperties() as FeatureProperties).shouldArchive);

  addFeaturesToSource("archived", archivedFeatures, () => {
    addFeaturesToSource("edit", editedFeatured, callback);
  });
};

export const removeEditedFeaturesFromSourceByIds = (featureIds: string[]) => {
  removeFeaturesFromSourceByIds("edit", featureIds);
  removeFeaturesFromSourceByIds("archived", featureIds);
};

export const addFeaturesToSource = (sourceId: LayerId, features: Feature<Geometry>[], callback?: () => void) => {
  const layer = getLayerById(sourceId) as VectorLayer<VectorSource>;
  const source = layer.getSource();
  if (!source) return;

  const newFeatures: Feature<Geometry>[] = [];

  features.forEach((feature) => {
    const id = feature.getId();
    if (id == null) return;

    const existingFeature = source.getFeatureById(id) as Feature<Geometry> | null;

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

export const removeFeaturesFromSourceByIds = (sourceId: LayerId, featureIds: string[]) => {
  const layer = getLayerById(sourceId) as VectorLayer<VectorSource>;
  const source = layer.getSource();
  if (!source) return;

  const removeFeature = (featureId: string) => {
    const featureToRemove = source.getFeatureById(featureId) as Feature<Geometry> | null;

    if (!featureToRemove) return null;

    // hvis delt, ikke slett
    const sharedIndex = featureToRemove.get("sharedIndex");

    if (sharedIndex != null && sharedIndex > 0) {
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

export const getFeatureId = (feature: Feature<Geometry>) => feature.getId()?.toString() ?? "";

export const getRepresentasjonspunktId = (entityId: string) => `${entityId}-representasjonspunkt`;

export const getFlateId = (entityId: string) => `${entityId}-flate`;
