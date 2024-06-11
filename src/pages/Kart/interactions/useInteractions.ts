import { map } from "pages/Kart/constants";
import useDragInteractions from "./useDragInteractions";
import useDraw from "./useDraw";
import { useEffect, useRef } from "react";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSelectPoint from "./useSelectPoint";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { GrenseId } from "hooks/layers/types";
import { useCursorStyles } from "./useCursorStyles";
import { SnapData, createKartlagSnapsData } from "./snapping-utils";
import { MapBrowserEvent } from "ol";
import { shiftKeyOnly } from "ol/events/condition";

const useInteractions = () => {
  const { modify } = useModify();
  const { dragPan, dragZoom } = useDragInteractions();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { selectPoint } = useSelectPoint();
  const { activeModeTools, activeTool } = useToolbar();
  const kartlagSnapData = useRef<Record<GrenseId, SnapData | null>>();

  const crosshairCursorTools: Tool[] = ["draw", "add", "remove", null];
  const pointerCursorTools: Tool[] = ["archive", "grenseinfo", "koordinater", "split"];

  useCursorStyles({
    isEnabled: !activeModeTools.includes("move") && crosshairCursorTools.includes(activeTool),
    defaultCursor: () => "crosshair",
  });

  useCursorStyles({
    isEnabled: pointerCursorTools.includes(activeTool),
    defaultCursor: () => "pointer",
  });

  useCursorStyles({
    isEnabled: !pointerCursorTools.includes(activeTool) && activeModeTools.includes("move"),
    defaultCursor: () => "grab",
    eventsAndCursor: [
      {
        name: "pointerdrag",
        cursor: (e) => (shiftKeyOnly(e as MapBrowserEvent<UIEvent>) ? "zoom-in" : "grabbing"),
      },
      {
        name: "mouseup",
        cursor: () => "grab",
      },
    ],
  });

  useEffect(() => {
    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(dragPan);
    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(dragZoom);

    // snaps må legges til etter modify og draw interactions
    kartlagSnapData.current = createKartlagSnapsData(activeModeTools, activeTool);
    Object.values(kartlagSnapData.current).forEach((snapData) => {
      if (snapData?.snap) {
        map.addInteraction(snapData.snap);
      }
      if (snapData?.hover) {
        map.addInteraction(snapData.hover);
      }
    });

    return () => {
      map.un("click", select);
      map.un("click", selectPoint);
      map.removeInteraction(dragPan);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(dragZoom);
      if (kartlagSnapData.current) {
        Object.values(kartlagSnapData.current).forEach((snapData) => {
          if (snapData?.hover) {
            map.removeInteraction(snapData.hover);
          }
          if (snapData?.snap) {
            map.removeInteraction(snapData.snap);
          }
        });
      }
    };
  }, [activeModeTools, activeTool, dragPan, dragZoom, draw, modify, select, selectPoint]);
};

export default useInteractions;
