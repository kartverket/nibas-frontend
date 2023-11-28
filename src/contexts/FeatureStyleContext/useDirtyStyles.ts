import { editSource } from "hooks/layers/constants";
import { useState } from "react";
import { grenseStyles } from "utils/map/layerStyles";

const useDirtyStyles = () => {
  const [dirtyFeatureIds, setDirtyFeatureIds] = useState<string[]>([]);
  const [savedDirtyFeatureIds, setSavedDirtyFeatureIds] = useState<string[]>(
    [],
  );

  // TODO: denne bør være felles for både dirty og archive, fordi den gjør mer magi
  const setDirtyFeaturesToEdit = (features: string[]) => {
    for (const featureId of features) {
      if (!savedDirtyFeatureIds.includes(featureId)) {
        editSource.getFeatureById(featureId)?.setStyle(grenseStyles.edit);
      }
    }
    setDirtyFeatureIds(
      dirtyFeatureIds.filter((dfi) => !features.includes(dfi)),
    );
  };

  const setDirtyFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.dirty);
    }
    for (const featureId of savedDirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.dirty);
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
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.dirty);
    }
    setSavedDirtyFeatureIds([...savedDirtyFeatureIds, ...features]);
  };

  const setAndSaveSammenslaaingsFeatures = (
    stemmekretsFeatureIds: string[],
    overlappingStemmekretsFeatureIds: string[],
  ) => {
    for (const featureId of stemmekretsFeatureIds) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(grenseStyles.sammenslaaing);
    }
    for (const featureId of overlappingStemmekretsFeatureIds) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(grenseStyles.sammenslaaingOverlapping);
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
