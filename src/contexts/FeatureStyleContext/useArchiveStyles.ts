import { useState } from "react";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeatureIds, setSavedArchivedFeatureIds] = useState<string[]>([]);

  // TODO: denne bør være felles for både dirty og archive, fordi den gjør mer magi
  const setArchivedFeaturesToEdit = (features: string[]) => {
    for (const featureId of features) {
      if (!savedArchivedFeatureIds.includes(featureId)) {
        setFeatureStyle(featureId, grenseStyles.edit);
      }
    }
    setArchivedFeatureIds(archivedFeatureIds.filter((afi) => !features.includes(afi)));
  };

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, (feature) => getArchiveLayerStyle(feature));
    }
    for (const featureId of savedArchivedFeatureIds) {
      setFeatureStyle(featureId, (feature) => getArchiveLayerStyle(feature));
    }
    setArchivedFeatureIds(features);
  };

  const saveArchivedFeatureIds = () => {
    setSavedArchivedFeatureIds([...savedArchivedFeatureIds, ...archivedFeatureIds]);
    setArchivedFeatureIds([]);
  };

  const setAndSaveUtkastArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, (feature) => getArchiveLayerStyle(feature));
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
    setArchivedFeaturesToEdit,
  };
};

export default useArchiveStyles;
