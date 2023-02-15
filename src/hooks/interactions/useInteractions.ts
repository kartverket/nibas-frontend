import { map } from "components/Kart/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useDrawInteraction from "./useDrawInteraction";
import useEditInteractions from "./useEditInteractions";
import useSelectInteraction from "./useSelectInteraction";
import useSplitInteraction from "./useSplitInteraction";

const useInteractions = () => {
  const { modify } = useEditInteractions();
  const { selectedFeatures } = useSelectInteraction();
  const { activeEditModes } = useToolbar();
  const { draw } = useDrawInteraction();
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

    if (activeEditModes.includes("draw")) {
      map.addInteraction(draw);
    }

    // snaps må legges til etter modify og draw interactions
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    return () => {
      map.un("click", split);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, draw, modify, split]);

  return { selectedFeatures };
};

export default useInteractions;
