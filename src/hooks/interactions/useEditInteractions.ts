import { useEffect } from "react";
import { Snap } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import { modify } from "./constants";
import useFeatureHistory from "./useFeatureHistory";
import { map } from "components/Kart/constants";
import { editSource } from "hooks/layers/constants";
import { getVectorLayers } from "utils/map/layers";
import { dirtyStyles } from "utils/map/layerStyles";

const useEditInteractions = () => {
  const { dirtyFeatureIds, clearHistory } = useFeatureHistory();

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
    const setDirtyStyleOnEditedFeature = (e: ModifyEvent) => {
      e.features.forEach((featureLike) => {
        const featureId = featureLike.getId();

        if (!featureId) return;

        editSource.getFeatureById(featureId).setStyle(dirtyStyles);
      });
    };

    modify.on("modifyend", setDirtyStyleOnEditedFeature);
  }, []);

  return {
    dirtyFeatureIds,
    clearHistory,
  };
};

export default useEditInteractions;
