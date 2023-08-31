import { map } from "pages/Kart/constants";
import { Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSplit from "./useSplit";
import useDraw from "./useDraw";
import useSelectPoint from "./useSelectPoint";
import { useToolbar } from "contexts/ToolbarContext";
import { pixelTolerance } from "./constants";

const useInteractions = () => {
  const { modify } = useModify();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { split } = useSplit();
  const { selectPoint } = useSelectPoint();
  const { activeEditModes } = useToolbar();

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();
      if (source) {
        const snap = new Snap({ source, pixelTolerance });
        snaps.push(snap);
      }
    });

    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", split);
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(modify);
    map.addInteraction(draw);

    // snaps må legges til etter modify og draw interactions
    if (activeEditModes.includes("snap")) {
      snaps.forEach((snap) => {
        map.addInteraction(snap);
      });
    }

    return () => {
      map.un("click", split);
      map.un("click", select);
      map.un("click", selectPoint);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      snaps.forEach((snap) => {
        map.removeInteraction(snap);
      });
    };
  }, [activeEditModes, draw, modify, select, selectPoint, split]);
};

export default useInteractions;
