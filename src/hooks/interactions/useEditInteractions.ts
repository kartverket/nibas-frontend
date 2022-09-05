import { useEffect } from "react";
import { Snap } from "ol/interaction";
import { modify } from "./constants";
import useDirtyStyles from "./useDirtyStyles";
import useFeatureHistory from "./useFeatureHistory";
import { map } from "components/Kart/constants";
import { getVectorLayers } from "utils/map/layers";

const useEditInteractions = () => {
  const featureHistory = useFeatureHistory();
  useDirtyStyles(featureHistory.dirtyFeatureIds);

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

  return {
    ...featureHistory,
  };
};

export default useEditInteractions;
