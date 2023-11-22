import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { useState } from "react";
import { getArchiveLayerStyle } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeatureIds, setSavedArchivedFeatureIds] = useState<
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
    setSavedArchivedFeatureIds([
      ...savedArchivedFeatureIds,
      ...archivedFeatureIds,
    ]);
    setArchivedFeatureIds([]);
  };

  const setAndSaveUtkastArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(
          getArchiveLayerStyle(editSource.getFeatureById(featureId) as Feature),
        );
    }
    setSavedArchivedFeatureIds([...savedArchivedFeatureIds, ...features]);
  };

  return {
    archivedFeatureIds,
    setArchivedFeatures,
    saveArchivedFeatureIds,
    setAndSaveUtkastArchivedFeatures,
  };
};

export default useArchiveStyles;
