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
    console.log(features);
    for (const featureId of features) {
      // TODO: utvid denne til å også fargelegge utenfor editSource?
      // skal trolig bare gjelde for lagrede utkastendringer...
      // kanskje en tredje liste hadde vært gunstig, som vi bare fyller i useKretsgrenser
      // så fargelegger den alt etter behov
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
    setSavedDirtyFeaturesIds(dirtyFeatureIds.concat(savedDirtyFeatureIds));
    setDirtyFeatureIds([]);
  };

  return {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
  };
};

export default useDirtyStyles;
