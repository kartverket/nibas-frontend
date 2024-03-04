import { useToolbar } from "contexts/ToolbarContext";
import { shiftKeyOnly } from "ol/events/condition";
import { DragPan, DragZoom } from "ol/interaction";
import { useMemo } from "react";
import { EventAndHandlerMap, useCursorStyles } from "./useCursorStyles";

const useDragInteractions = () => {
  const { activeModeTools } = useToolbar();

  const eventsAndHandlers: EventAndHandlerMap = [
    {
      name: ["pointermove"],
      handler: (mapViewport: HTMLElement) => {
        mapViewport.style.cursor = "grab";
      },
    },
    {
      name: ["pointerdrag"],
      handler: (mapViewport: HTMLElement) => {
        mapViewport.style.cursor = "grabbing";
      },
    },
  ];

  useCursorStyles(activeModeTools.includes("move"), eventsAndHandlers);

  const dragPan = useMemo(
    () =>
      new DragPan({
        condition: (e) => activeModeTools.includes("move") && !shiftKeyOnly(e),
      }),
    [activeModeTools],
  );

  const dragZoom = useMemo(
    () =>
      new DragZoom({
        condition: (e) => activeModeTools.includes("move") && shiftKeyOnly(e),
      }),
    [activeModeTools],
  );

  return { dragPan, dragZoom };
};

export default useDragInteractions;
