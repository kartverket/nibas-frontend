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
    console.log("skal cleare ALT, her er ny dirty", dirtyFeatureIds);
    console.log("skal cleare ALT, her er saved dirty", savedDirtyFeatureIds);
    for (const featureId of dirtyFeatureIds) {
      console.log(editSource.getFeatureById(featureId));
      editSource.getFeatureById(featureId)?.setStyle(editStyles);
    }
    for (const featureId of savedDirtyFeatureIds) {
      console.log(editSource.getFeatureById(featureId));
      editSource.getFeatureById(featureId)?.setStyle(editStyles);
    }
    setSavedDirtyFeaturesIds([]);
    setDirtyFeatureIds([]);
  };

  const saveDirtyFeatureIds = () => {
    setSavedDirtyFeaturesIds(dirtyFeatureIds.concat(savedDirtyFeatureIds));
    setDirtyFeatureIds([]);
  };

  // const addDirtyFeatureId = (featureIdToAdd: string) => {
  //   editSource.getFeatureById(featureIdToAdd)?.setStyle(dirtyStyles);
  //   setDirtyFeatureIds(dirtyFeatureIds.concat(featureIdToAdd));
  // };

  // const removeDirtyFeatureId = (featureIdToRemove: string) => {
  //   setDirtyFeatureIds(
  //     dirtyFeatureIds.filter((dfi) => dfi !== featureIdToRemove)
  //   );
  //   editSource.getFeatureById(featureIdToRemove)?.setStyle(editStyles);
  // };

  // const saveDirtyFeatures = () => {
  //   setSavedDirtyFeaturesIds(savedDirtyFeatureIds.concat(dirtyFeatureIds));
  //   setDirtyFeatureIds([]);
  // };

  return {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
  };

  /*
  useEffect(() => {
    //fjerner dirty-styles

    // finn hvilke features som har hatt dirty style, men ikke
    // lenger regnes som dirty i history
    const featuresIdsToGetEditStyle = featureIdsWithDirtyStyle.filter(
      (styleId) => !dirtyFeatureIds.includes(styleId)
    );

    if (featuresIdsToGetEditStyle.length === 0) return;

    const newFeatureIdsWithDirtyStyle = featureIdsWithDirtyStyle.slice();

    // disse skal nå få tilbake sin vanlige style, og fjernes fra lista
    featuresIdsToGetEditStyle.forEach((featureId) => {
      console.log(featureId + " fjernes fra dirty");
      editSource.getFeatureById(featureId)?.setStyle(editStyles);
      newFeatureIdsWithDirtyStyle.splice(
        newFeatureIdsWithDirtyStyle.indexOf(featureId)
      );
    });

    setFeatureIdsWithDirtyStyle(newFeatureIdsWithDirtyStyle);
  }, [dirtyFeatureIds, featureIdsWithDirtyStyle]);

  useEffect(() => {
    // finn hvilke features som skal ha dirty style
    const featuresIdsToGetDirtyStyle = dirtyFeatureIds.filter(
      (styleId) => !featureIdsWithDirtyStyle.includes(styleId)
    );

    if (featuresIdsToGetDirtyStyle.length === 0) return;

    const newFeatureIdsWithDirtyStyle = featureIdsWithDirtyStyle.slice();

    featuresIdsToGetDirtyStyle.forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(dirtyStyles);
      newFeatureIdsWithDirtyStyle.push(featureId);
    });

    setFeatureIdsWithDirtyStyle(newFeatureIdsWithDirtyStyle);
  }, [dirtyFeatureIds, featureIdsWithDirtyStyle]);
  */
};

export default useDirtyStyles;
