import { useEffect, useState } from "react";
import { editSource } from "hooks/layers/constants";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const useDirtyStyles = (dirtyFeatureIds: string[]) => {
  const [featureIdsWithDirtyStyle, setFeatureIdsWithDirtyStyle] = useState<
    string[]
  >([]);

  useEffect(() => {
    // finn hvilke features som har hatt dirty style, men ikke
    // lenger regnes som dirty i history
    const featuresIdsToGetEditStyle = featureIdsWithDirtyStyle.filter(
      (styleId) => !dirtyFeatureIds.includes(styleId)
    );

    if (featuresIdsToGetEditStyle.length === 0) return;

    const newFeatureIdsWithDirtyStyle = featureIdsWithDirtyStyle.slice();

    // disse skal nå få tilbake sin vanlige style, og fjernes fra lista
    featuresIdsToGetEditStyle.forEach((featureId) => {
      editSource.getFeatureById(featureId).setStyle(editStyles);
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
};

export default useDirtyStyles;
