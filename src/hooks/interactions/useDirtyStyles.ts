import { editSource } from "hooks/layers/constants";
import { useState } from "react";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const useDirtyStyles = () => {
  const [dirtyFeatureIds, setDirtyFeatureIds] = useState<string[]>([]);
  const [savedDirtyFeatureIds, setSavedDirtyFeaturesIds] = useState<string[]>(
    []
  );

  const setEditFeatures = (features: string[]) => {
    for (const featureId of features) {
      if (!savedDirtyFeatureIds.includes(featureId)) {
        editSource.getFeatureById(featureId)?.setStyle(editStyles);
      }
    }
    setDirtyFeatureIds(
      dirtyFeatureIds.filter((dfi) => !features.includes(dfi))
    );
  };

  const setDirtyFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(dirtyStyles);
    }
    for (const featureId of savedDirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(dirtyStyles);
    }
    setDirtyFeatureIds(features);
  };

  const clearSavedDirtyFeatureIds = () => {
    for (const featureId of dirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(editStyles);
    }
    for (const featureId of savedDirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(editStyles);
    }
    setSavedDirtyFeaturesIds([]);
    setDirtyFeatureIds([]);
  };

  const saveUtkastDirtyFeatureIds = (features: string[]) => {
    setSavedDirtyFeaturesIds(features.concat(savedDirtyFeatureIds));
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(dirtyStyles);
    }
  };

  const saveDirtyFeatureIds = () => {
    setSavedDirtyFeaturesIds(dirtyFeatureIds.concat(savedDirtyFeatureIds));
    setDirtyFeatureIds([]);
  };

  return {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    saveUtkastDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
  };
};

export default useDirtyStyles;
