import { useMemo } from "react";
import { useToolbar } from "contexts/ToolbarContext";
import { DragPan, DragZoom } from "ol/interaction";
import { shiftKeyOnly } from "ol/events/condition";

const useDragInteractions = () => {
  const { activeModeTools } = useToolbar();

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
