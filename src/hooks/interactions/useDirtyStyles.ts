import { editSource } from "hooks/layers/constants";
import { useState } from "react";
import {
  dirtyOverlappingSammenslaaingStyles,
  dirtySammenslaaingStyles,
  dirtyStyles,
  editStyles,
} from "utils/map/layerStyles";

// TODO: bør kanskje tydeliggjøres at denne bare bør brukes i ToolbarContext, kanskje legg den inn i den filen
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

  const saveDirtyFeatureIds = () => {
    setSavedDirtyFeaturesIds([...savedDirtyFeatureIds, ...dirtyFeatureIds]);
    setDirtyFeatureIds([]);
  };

  const setAndSaveUtkastFeatures = (features: string[]) => {
    for (const featureId of features) {
      editSource.getFeatureById(featureId)?.setStyle(dirtyStyles);
    }
    setSavedDirtyFeaturesIds([...savedDirtyFeatureIds, ...features]);
  };

  const setAndSaveSammenslaaingsFeatures = (
    stemmekretsFeatureIds: string[],
    overlappingStemmekretsFeatureIds: string[]
  ) => {
    for (const featureId of stemmekretsFeatureIds) {
      editSource.getFeatureById(featureId)?.setStyle(dirtySammenslaaingStyles);
    }
    for (const featureId of overlappingStemmekretsFeatureIds) {
      editSource
        .getFeatureById(featureId)
        ?.setStyle(dirtyOverlappingSammenslaaingStyles);
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
  };
};

export default useDirtyStyles;
