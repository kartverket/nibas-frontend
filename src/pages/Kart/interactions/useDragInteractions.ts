import { useToolbar } from "contexts/ToolbarContext";
import { shiftKeyOnly } from "ol/events/condition";
import { DragPan, DragZoom } from "ol/interaction";

const useDragInteractions = () => {
  const { activeModeTools } = useToolbar();

  const dragPan = new DragPan({
    condition: (e) => activeModeTools.includes("move") && !shiftKeyOnly(e),
  });

  const dragZoom = new DragZoom({
    condition: (e) => shiftKeyOnly(e),
  });

  return { dragPan, dragZoom };
};

export default useDragInteractions;
