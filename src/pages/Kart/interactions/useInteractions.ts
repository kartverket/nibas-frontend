import { useToolbar } from "contexts/ToolbarContext";
import { Collection } from "ol";
import { Modify, Snap } from "ol/interaction";
import { map } from "pages/Kart/constants";
import { useEffect } from "react";
import { selectedPointStyle } from "utils/map/layerStyles";
import { getVectorLayers } from "utils/map/layers";
import { pixelTolerance } from "./constants";
import { useCursorStyles } from "./useCursorStyles";
import useDragInteractions from "./useDragInteractions";
import useDraw from "./useDraw";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSelectPoint from "./useSelectPoint";

const useInteractions = () => {
  const { modify } = useModify();
  const { dragPan, dragZoom } = useDragInteractions();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { selectPoint } = useSelectPoint();
  const { activeTool, activeModeTools } = useToolbar();

  // I redigering, tegning av ny grense, legg til punkt, eller fjern punkt
  useCursorStyles({
    isEnabled:
      !activeModeTools.includes("move") &&
      (activeTool === "draw" || activeTool === "add" || activeTool === "remove" || activeTool === null),
    defaultCursor: () => "crosshair",
  });

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
            condition: () => false,
            style: selectedPointStyle,
            pixelTolerance: pixelTolerance,
            features: new Collection(
              source.getFeatures().filter((feature) => !feature.getId()?.toString().includes("representasjonspunkt")),
            ),
          }),
        );
      }
    });

    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(dragPan);
    map.addInteraction(dragZoom);
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
      map.removeInteraction(dragZoom);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      snaps.forEach((snap) => map.removeInteraction(snap));
      hovers.forEach((hover) => map.removeInteraction(hover));
    };
  }, [activeModeTools, dragPan, dragZoom, draw, modify, select, selectPoint]);
};

export default useInteractions;
