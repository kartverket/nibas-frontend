import { archivedSource } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { isFeatureToBeArchived } from "utils/features";
import { FeatureProperties } from "../../types/api";
import { getLayerById } from "./layers";

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

const setSharedIndexIfFeatureInSource = (source: VectorSource, featureId: string): boolean => {
  const existingFeature = source.getFeatureById(featureId) as Feature<Geometry> | null;

  // oppdatere eksisterende feature hvis den finnes, så den ikke slettes
  // når nærliggende grense fjernes
  if (existingFeature) {
    const sharedIndex = existingFeature.get("sharedIndex") ?? 0;
    existingFeature.set("sharedIndex", sharedIndex + 1);
    return true;
  }

  return false;
};

export const addFeaturesToSource = (sourceId: LayerId, features: Feature<Geometry>[], callback?: () => void) => {
  const layer = getLayerById(sourceId) as VectorLayer<Feature>;
  const source = layer.getSource();
  if (!source) {
    return;
  }

  const newFeatures: Feature<Geometry>[] = [];

  features.forEach((feature) => {
    const id = feature.getId();
    if (id == null) {
      return;
    }

    const shouldBeArchived = isFeatureToBeArchived(feature);
    if (shouldBeArchived) {
      const didSetSharedIndex = !setSharedIndexIfFeatureInSource(archivedSource, feature.getId()?.toString() ?? "");

      if (didSetSharedIndex) {
        archivedSource.addFeature(feature);
        return;
      }
    }
    newFeatures.push(feature);
  });

  source.addFeatures(newFeatures);
  if (callback) {
    callback();
  }
};

export const removeFeaturesFromSourceByIds = (sourceId: LayerId, featureIds: string[]) => {
  const layer = getLayerById(sourceId) as VectorLayer<Feature>;
  const source = layer.getSource();
  if (!source) {
    return;
  }

  const removeFeature = (featureId: string) => {
    const featureToRemove = source.getFeatureById(featureId) as Feature<Geometry> | null;

    if (!featureToRemove) {
      return null;
    }

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

export const getRepresentasjonspunktId = (entityId: string) => `${entityId}-representasjonspunkt`;
