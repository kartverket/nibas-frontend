import { useState } from "react";
import { grenseStyles, setFeatureStyle } from "utils/map/layerStyles";

const useDirtyStyles = () => {
  const [dirtyFeatureIds, setDirtyFeatureIds] = useState<string[]>([]);
  const [savedDirtyFeatureIds, setSavedDirtyFeatureIds] = useState<string[]>([]);

  // TODO: denne bør være felles for både dirty og archive, fordi den gjør mer magi
  const setDirtyFeaturesToEdit = (features: string[]) => {
    for (const featureId of features) {
      if (!savedDirtyFeatureIds.includes(featureId)) {
        setFeatureStyle(featureId, grenseStyles.dirty);
      }
    }
    setDirtyFeatureIds(dirtyFeatureIds.filter((dfi) => !features.includes(dfi)));
  };

  const setDirtyFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, grenseStyles.dirty);
    }
    for (const featureId of savedDirtyFeatureIds) {
      setFeatureStyle(featureId, grenseStyles.dirty);
    }
    setDirtyFeatureIds(features);
  };

  const clearDirtyStyles = () => {
    setSavedDirtyFeatureIds([]);
    setDirtyFeatureIds([]);
  };

  const saveDirtyFeatureIds = () => {
    setSavedDirtyFeatureIds([...savedDirtyFeatureIds, ...dirtyFeatureIds]);
    setDirtyFeatureIds([]);
  };

  const setAndSaveUtkastFeatures = (features: string[]) => {
    for (const featureId of features) {
      setFeatureStyle(featureId, grenseStyles.dirty);
    }
    setSavedDirtyFeatureIds([...savedDirtyFeatureIds, ...features]);
  };

  const setAndSaveSammenslaaingsFeatures = (
    stemmekretsFeatureIds: string[],
    overlappingStemmekretsFeatureIds: string[],
  ) => {
    for (const featureId of stemmekretsFeatureIds) {
      setFeatureStyle(featureId, grenseStyles.sammenslaaing);
    }
    for (const featureId of overlappingStemmekretsFeatureIds) {
      setFeatureStyle(featureId, grenseStyles.sammenslaaingOverlapping);
    }
  };

  return {
    dirtyFeatureIds,
    clearDirtyStyles,
    setDirtyFeatures,
    setDirtyFeaturesToEdit,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  };
};

export default useDirtyStyles;
