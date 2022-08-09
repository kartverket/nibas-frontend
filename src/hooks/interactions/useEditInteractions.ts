import { useEffect, useState } from "react";
import { Snap } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import useFeatureHistory from "./useFeatureHistory";
import { map } from "components/Kart/constants";
import { editSource } from "hooks/layers/constants";
import { getVectorLayers } from "utils/map/layers";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const useEditInteractions = () => {
  const featureHistory = useFeatureHistory();
  const [featureIdsWithDirtyStyle, setFeatureIdsWithDirtyStyle] = useState<
    string[]
  >([]);

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();

      const snap = new Snap({ source });

      snaps.push(snap);
    });

    map.addInteraction(modify);
    // snaps må legges til etter modify og draw interactions
    snaps.forEach((snap) => {
      map.addInteraction(snap);
    });

    return () => {
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, []);

  useEffect(() => {
    // sett style på de endrede featurene på modifyend
    // dette funker ikke på modifystart, så gjøres når brukeren slipper musa
    const setDirtyStyleOnEditedFeature = () => {
      featureHistory.dirtyFeatureIds.forEach((featureId) => {
        editSource.getFeatureById(featureId).setStyle(dirtyStyles);
        setFeatureIdsWithDirtyStyle((prevIds) => [...prevIds, featureId]);
      });
    };

    modify.on("modifyend", setDirtyStyleOnEditedFeature);

    return () => {
      modify.un("modifyend", setDirtyStyleOnEditedFeature);
    };
  }, [featureHistory.dirtyFeatureIds]);

  useEffect(() => {
    // finn hvilke features som har hatt dirty style, men ikke
    // lenger regnes som dirty i history
    const featuresToResetStyle = featureIdsWithDirtyStyle.filter(
      (styleId) => !featureHistory.dirtyFeatureIds.includes(styleId)
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
  }, [featureHistory.dirtyFeatureIds, featureIdsWithDirtyStyle]);

  return {
    ...featureHistory,
  };
};

export default useEditInteractions;
