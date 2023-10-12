import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { useState } from "react";
import { getArchiveLayerStyle } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeaturesIds, setSavedArchivedFeaturesIds] = useState<
    string[]
  >([]);

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(
          getArchiveLayerStyle(editSource.getFeatureById(featureId) as Feature),
        );
    }
    for (const featureId of archivedFeatureIds) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(
          getArchiveLayerStyle(editSource.getFeatureById(featureId) as Feature),
        );
    }
    setArchivedFeatureIds(features);
  };

  const saveArchivedFeatureIds = () => {
    setSavedArchivedFeaturesIds([
      ...savedArchivedFeaturesIds,
      ...archivedFeatureIds,
    ]);
    setArchivedFeatureIds([]);
  };

  return {
    archivedFeatureIds,
    setArchivedFeatures,
    saveArchivedFeatureIds,
  };
};

export default useArchiveStyles;
