import { useToolbar } from "contexts/ToolbarContext";
import { shiftKeyOnly } from "ol/events/condition";
import { DragPan, DragZoom } from "ol/interaction";
import { useEffect, useMemo } from "react";
import { map } from "../constants";

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

  useEffect(() => {
    const mapViewport = map.getViewport();
    const handleMouseDown = () => {
      mapViewport.style.cursor = "grabbing";
    };
    const handleMouseMove = () => {
      mapViewport.style.cursor = "grab";
    };

    if (activeModeTools.includes("move")) {
      map.on("pointerdrag", handleMouseDown);
      map.on("pointermove", handleMouseMove);
    } else {
      mapViewport.style.cursor = "";
    }

    return () => {
      map.un("pointerdrag", handleMouseDown);
      map.un("pointermove", handleMouseMove);
      mapViewport.style.cursor = "";
    };
  }, [activeModeTools]);

  return { dragPan, dragZoom };
};

export default useDragInteractions;
