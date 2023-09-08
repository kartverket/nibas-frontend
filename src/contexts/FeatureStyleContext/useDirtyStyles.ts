import { editSource } from "hooks/layers/constants";
import { useState } from "react";
import { grenseStyles } from "utils/map/layerStyles";

const useDirtyStyles = () => {
  const [dirtyFeatureIds, setDirtyFeatureIds] = useState<string[]>([]);
  const [savedDirtyFeatureIds, setSavedDirtyFeaturesIds] = useState<string[]>(
    []
  );
  const [archivedFeatureIds, setArchivedFeatureIds] = useState<string[]>([]);
  const [savedArchivedFeatureIds, setSavedArchivedFeatureIds] = useState<
    string[]
  >([]);

  const setEditFeatures = (features: string[]) => {
    for (const featureId of features) {
      if (!savedDirtyFeatureIds.includes(featureId)) {
        editSource.getFeatureById(featureId)?.setStyle(grenseStyles.edit);
      }
    }
    setDirtyFeatureIds(
      dirtyFeatureIds.filter((dfi) => !features.includes(dfi))
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

  const setArchivedFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.archived);
    }
    for (const featureId of savedDirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.archived);
    }
    setArchivedFeatureIds(features);
  };

  const clearSavedDirtyFeatureIds = () => {
    for (const featureId of dirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.edit);
    }
    for (const featureId of savedDirtyFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.edit);
    }
    setSavedDirtyFeaturesIds([]);
    setDirtyFeatureIds([]);
  };

  const saveDirtyFeatureIds = () => {
    setSavedDirtyFeaturesIds([...savedDirtyFeatureIds, ...dirtyFeatureIds]);
    setDirtyFeatureIds([]);
  };

  const setAndSaveUtkastFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(grenseStyles.dirty);
    }
    setSavedDirtyFeaturesIds([...savedDirtyFeatureIds, ...features]);
  };

  const setAndSaveSammenslaaingsFeatures = (
    stemmekretsFeatureIds: string[],
    overlappingStemmekretsFeatureIds: string[]
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
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
    archivedFeatureIds,
    setArchivedFeatures,
  };
};

export default useDirtyStyles;
