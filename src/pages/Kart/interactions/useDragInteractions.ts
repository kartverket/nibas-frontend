import { useToolbar } from "contexts/ToolbarContext";
import { shiftKeyOnly } from "ol/events/condition";
import { DragPan, DragZoom } from "ol/interaction";
import { useMemo } from "react";

const useDragInteractions = () => {
  const { activeModeTools } = useToolbar();

  const dragPan = useMemo(
    () =>
      new DragPan({
        condition: (e) => activeModeTools.includes("move") && !shiftKeyOnly(e),
      }),
    [activeModeTools],
  );

  const dragZoom = new DragZoom({
    condition: (e) => shiftKeyOnly(e),
  });

  return { dragPan, dragZoom };
};

export default useDragInteractions;
