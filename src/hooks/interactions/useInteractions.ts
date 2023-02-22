import { map } from "components/Kart/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useEditInteractions from "./useEditInteractions";
import useSelectInteraction from "./useSelectInteraction";
import useSplitInteraction from "./useSplitInteraction";

const useInteractions = () => {
  const { modify } = useEditInteractions();
  const { selectedFeatures } = useSelectInteraction();
  const { activeEditModes } = useToolbar();
  const { split } = useSplitInteraction();

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();
      const snap = new Snap({ source });
      snaps.push(snap);
    });

    map.on("click", split);
    map.addInteraction(modify);

    // snaps må legges til etter modify og draw interactions
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    return () => {
      map.un("click", split);
      map.removeInteraction(modify);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, modify, split]);

  return { selectedFeatures };
};

export default useInteractions;
