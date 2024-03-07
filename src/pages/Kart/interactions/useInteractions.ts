import { map } from "pages/Kart/constants";
import { Modify, Snap } from "ol/interaction";
import { useEffect, useMemo } from "react";
import { getVectorLayers } from "utils/map/layers";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useDraw from "./useDraw";
import useDragInteractions from "./useDragInteractions";
import useSelectPoint from "./useSelectPoint";
import { useToolbar } from "contexts/ToolbarContext";
import { pixelTolerance } from "./constants";
import { selectedPointStyle } from "utils/map/layerStyles";
import { Collection, MapBrowserEvent } from "ol";
import { useCursorStyles } from "./useCursorStyles";
import { useGetFeatures } from "./utils";
import BaseEvent from "ol/events/Event";
import { shiftKeyOnly } from "ol/events/condition";

const useInteractions = () => {
  const { modify } = useModify();
  const { dragPan, dragZoom } = useDragInteractions();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { selectPoint } = useSelectPoint();
  const { activeTool, activeModeTools } = useToolbar();
  const { getActiveFeaturesAtPixel } = useGetFeatures();

  const memoizedCondition = useMemo(
    () => (e: Event | BaseEvent | undefined) =>
      e ? getActiveFeaturesAtPixel(e as MapBrowserEvent<MouseEvent>, null).length > 0 : false,
    [getActiveFeaturesAtPixel],
  );

  // Kun i rediger ("move"-cursor på hover over active feature)
  useCursorStyles({
    isEnabled: activeTool === null && !activeModeTools.includes("move"),
    defaultCursor: { style: (e) => (memoizedCondition(e) ? "move" : "crosshair") },
  });

  // Tegning av ny grense, legg til punkt, eller fjern punkt
  useCursorStyles({
    isEnabled: activeTool === "draw" || activeTool === "add" || activeTool === "remove",
    defaultCursor: {
      style: () => "crosshair",
    },
  });

  // DragPan og DragZoom
  useCursorStyles({
    isEnabled: activeModeTools.includes("move"),
    defaultCursor: { style: () => "grab" },
    eventsAndCursor: [
      {
        name: ["pointermove"],
        cursor: { style: (e) => (shiftKeyOnly(e as MapBrowserEvent<UIEvent>) ? "zoom-in" : "grabbing") },
      },
    ],
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
