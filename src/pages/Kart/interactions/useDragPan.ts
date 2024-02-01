import { useMemo } from "react";
import { useToolbar } from "contexts/ToolbarContext";
import { DragPan } from "ol/interaction";

const useDragPan = () => {
  const { activeModeTools } = useToolbar();

  const dragPan = useMemo(
    () =>
      new DragPan({
        condition: () => activeModeTools.includes("move"),
      }),
    [activeModeTools],
  );

  return { dragPan };
};

export default useDragPan;
