import { useMemo, useState } from "react";
import { useToolbar } from "contexts/ToolbarContext";
import { DragPan, DragZoom } from "ol/interaction";
import { useHoldButtonToggle } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

const useDragPan = () => {
  const { activeModeTools } = useToolbar();

  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // må disable dargPan iteraksjonen ved keypress av shift slik at brukeren ikke kan panorere når man prøver å markere et område
  useHoldButtonToggle(
    "shift",
    isShiftPressed,
    () => setIsShiftPressed(true),
    () => setIsShiftPressed(false),
  );

  const dragPan = useMemo(
    () =>
      new DragPan({
        condition: () => activeModeTools.includes("move") && !isShiftPressed,
      }),
    [activeModeTools, isShiftPressed],
  );

  const dragZoom = new DragZoom({
    condition: () => activeModeTools.includes("move") && isShiftPressed,
  });

  return { dragPan, dragZoom };
};

export default useDragPan;
