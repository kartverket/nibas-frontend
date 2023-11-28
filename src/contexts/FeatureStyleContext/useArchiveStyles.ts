import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { useState } from "react";
import { getArchiveLayerStyle, grenseStyles } from "utils/map/layerStyles";

const useArchiveStyles = () => {
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeatureIds, setSavedArchivedFeatureIds] = useState<
    string[]
  >([]);

  // TODO: denne bør være felles for både dirty og archive, fordi den gjør mer magi
  const setArchivedFeaturesToEdit = (features: string[]) => {
    for (const featureId of features) {
      if (!savedArchivedFeatureIds.includes(featureId)) {
        editSource.getFeatureById(featureId)?.setStyle(grenseStyles.edit);
      }
    }
    setArchivedFeatureIds(
      archivedFeatureIds.filter((afi) => !features.includes(afi)),
    );
  };

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(
          getArchiveLayerStyle(editSource.getFeatureById(featureId) as Feature),
        );
    }
    for (const featureId of savedArchivedFeatureIds) {
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
