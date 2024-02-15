import { map } from "pages/Kart/constants";
import { Modify, Snap } from "ol/interaction";
import { useEffect } from "react";
import { getVectorLayers } from "utils/map/layers";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useDraw from "./useDraw";
import useDragPan from "./useDragPan";
import useSelectPoint from "./useSelectPoint";
import { useToolbar } from "contexts/ToolbarContext";
import { pixelTolerance } from "./constants";
import { selectedPointStyle } from "utils/map/layerStyles";

const useInteractions = () => {
  const { modify } = useModify();
  const { dragPan } = useDragPan();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { selectPoint } = useSelectPoint();
  const { activeModeTools } = useToolbar();

  useEffect(() => {
    const vectorLayers = getVectorLayers();
    const snaps: Snap[] = [];
    const hovers: Modify[] = [];

    vectorLayers.forEach((layer) => {
      const source = layer.getSource();
      if (source) {
        const snap = new Snap({ source, pixelTolerance });
        snaps.push(snap);
        hovers.push(
          new Modify({
            source,
            condition: () => false,
            style: selectedPointStyle,
            pixelTolerance: pixelTolerance,
          }),
        );
      }
    });

    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(dragPan);
    map.addInteraction(modify);
    map.addInteraction(draw);

    // snaps må legges til etter modify og draw interactions
    if (activeModeTools.includes("snap")) {
      snaps.forEach((snap) => map.addInteraction(snap));
    }
    hovers.forEach((hover) => map.addInteraction(hover));

    return () => {
      map.un("click", select);
      map.un("click", selectPoint);
      map.removeInteraction(dragPan);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      snaps.forEach((snap) => map.removeInteraction(snap));
      hovers.forEach((hover) => map.removeInteraction(hover));
    };
  }, [activeModeTools, dragPan, draw, modify, select, selectPoint]);
};

export default useInteractions;
