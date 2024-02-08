import { useState } from "react";
import { getArchiveLayerStyle, setFeatureStyle } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeatureIds, setSavedArchivedFeatureIds] = useState<string[]>([]);

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, getArchiveLayerStyle);
    }
    for (const featureId of savedArchivedFeatureIds) {
      setFeatureStyle(featureId, getArchiveLayerStyle);
    }
    setArchivedFeatureIds(features);
  };

  const saveArchivedFeatureIds = () => {
    setSavedArchivedFeatureIds([...savedArchivedFeatureIds, ...archivedFeatureIds]);
    setArchivedFeatureIds([]);
  };

  const setAndSaveUtkastArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, getArchiveLayerStyle);
    }
    setSavedArchivedFeatureIds([...savedArchivedFeatureIds, ...features]);
  };

  const clearArchivedStyles = () => {
    setArchivedFeatureIds([]);
    setSavedArchivedFeatureIds([]);
  };

  return {
    archivedFeatureIds,
    setArchivedFeatures,
    clearArchivedStyles,
    saveArchivedFeatureIds,
    savedArchivedFeatureIds,
    setAndSaveUtkastArchivedFeatures,
  };
};

export default useArchiveStyles;
