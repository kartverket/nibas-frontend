import { useToolbar } from "contexts/ToolbarContext";
import { shiftKeyOnly } from "ol/events/condition";
import { DragPan, DragZoom } from "ol/interaction";
import { useMemo } from "react";
import { useCursorStyles } from "./useCursorStyles";

const useDragInteractions = () => {
  const { activeModeTools } = useToolbar();
  useCursorStyles(activeModeTools.includes("move"), [
    {
      name: ["pointermove"],
      cursor: "grab",
    },
    {
      name: ["pointerdrag"],
      cursor: "grabbing",
    },
  ]);

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
