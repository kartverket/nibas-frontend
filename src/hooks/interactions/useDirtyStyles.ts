import { useEffect, useState } from "react";
import { modify } from "./constants";
import { editSource } from "hooks/layers/constants";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const useDirtyStyles = (dirtyFeatureIds: string[]) => {
  const [featureIdsWithDirtyStyle, setFeatureIdsWithDirtyStyle] = useState<
    string[]
  >([]);

  useEffect(() => {
    // sett style på de endrede featurene på modifyend
    // dette funker ikke på modifystart, så gjøres når brukeren slipper musa
    const setDirtyStyleOnEditedFeature = () => {
      dirtyFeatureIds.forEach((featureId) => {
        editSource.getFeatureById(featureId).setStyle(dirtyStyles);
        setFeatureIdsWithDirtyStyle((prevIds) => [...prevIds, featureId]);
      });
    };

    modify.on("modifyend", setDirtyStyleOnEditedFeature);

    return () => {
      modify.un("modifyend", setDirtyStyleOnEditedFeature);
    };
  }, [dirtyFeatureIds]);

  useEffect(() => {
    // finn hvilke features som har hatt dirty style, men ikke
    // lenger regnes som dirty i history
    const featuresToResetStyle = featureIdsWithDirtyStyle.filter(
      (styleId) => !dirtyFeatureIds.includes(styleId)
    );

    if (featuresToResetStyle.length === 0) return;

    const newFeatureIdsWithDirtyStyle = featureIdsWithDirtyStyle.slice();

    // disse skal nå få tilbake sin vanlige style, og fjernes fra lista
    featuresToResetStyle.forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
      newFeatureIdsWithDirtyStyle.splice(
        newFeatureIdsWithDirtyStyle.indexOf(featureId)
      );
    });

    setFeatureIdsWithDirtyStyle(newFeatureIdsWithDirtyStyle);
  }, [dirtyFeatureIds, featureIdsWithDirtyStyle]);
};

export default useDirtyStyles;
