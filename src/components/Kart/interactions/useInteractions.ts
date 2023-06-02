import { map } from "components/Kart/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSplit from "./useSplit";

const useInteractions = () => {
  const { modify } = useModify();
  const { select } = useSelect();
  const { activeEditModes } = useToolbar();
  const { split } = useSplit();

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
    map.addInteraction(select);

    // snaps må legges til etter modify og draw interactions
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    return () => {
      map.un("click", split);
      map.removeInteraction(modify);
      map.removeInteraction(select);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, modify, select, split]);
};

export default useInteractions;
