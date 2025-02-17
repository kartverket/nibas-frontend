import { Tool, useToolbar } from "contexts/ToolbarContext";
import { GrenseId } from "hooks/layers/types";
import { MapBrowserEvent } from "ol";
import { shiftKeyOnly } from "ol/events/condition";
import { map } from "pages/Kart/constants";
import { useEffect, useRef } from "react";
import { FeatureProperties, Metadata, Posisjonskvalitet } from "types/api";
import { SnapData, createKartlagSnapsData } from "./snapping-utils";
import { useCursorStyles } from "./useCursorStyles";
import useDragInteractions from "./useDragInteractions";
import useDraw from "./useDraw";
import useMeasure from "./useMeasure";
import useModify from "./useModify";
import useSelect from "./useSelect";
import useSelectPoint from "./useSelectPoint";
import { useSnappedLineString } from "./useSnappedLineString";
import { isPointFeature } from "utils/type-utils";
const useInteractions = () => {
  const { modify } = useModify();
  const { dragPan, dragZoom } = useDragInteractions();
  const { select } = useSelect();
  const { draw } = useDraw();
  const { measureInteraction } = useMeasure();
  const { selectPoint } = useSelectPoint();
  const { activeModeTools, activeTool } = useToolbar();
  const kartlagSnapData = useRef<Record<GrenseId, SnapData | null>>();

  useSnappedLineString(modify, (e, actingLineString, targetLineString, snappedPoint) => {
    const targetLineStringPosisjonskvalitet = (
      (targetLineString.getProperties() as FeatureProperties).metadata as Metadata
    ).commonGrense?.posisjonskvalitet;

    if (targetLineStringPosisjonskvalitet != null && isPointFeature(snappedPoint)) {
      const pointCoords = snappedPoint.getGeometry()?.getCoordinates();
      if (pointCoords != null) {
        const snappedPosisjonskvaliteter: Map<string, Posisjonskvalitet> =
          actingLineString.get("snapData") ?? new Map();
        actingLineString.set(
          "snapData",
          snappedPosisjonskvaliteter.set(pointCoords.toString(), targetLineStringPosisjonskvalitet),
        );
        console.log(actingLineString);
      }
    }
  });

  const crosshairCursorTools: Tool[] = ["draw", "add", "remove", "measure", null];
  const pointerCursorTools: Tool[] = ["archive", "grenseinfo", "grensecoordinates", "koordinater", "split", "delete"];

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
    if (activeTool === "measure") {
      map.addInteraction(measureInteraction);
    } else {
      map.removeInteraction(measureInteraction);
    }
  }, [activeTool, measureInteraction]);
  // Legger til/fjerner `draw`-interaksjonen **bare** når `activeTool === "draw"`. På den måten unngår vi at `draw` nullstilles hver gang vi for eksempel
  // toggler snap. `draw` blir kun  fjernet hvis brukeren faktisk bytter verktøy bort fra "draw".
  useEffect(() => {
    if (activeTool === "draw") {
      map.addInteraction(draw);
    } else {
      map.removeInteraction(draw);
    }
  }, [activeTool, draw]);
  useEffect(() => {
    // Rekkefølgen her er potensielt viktig for at events skal avbryte hverandre i riktig rekkefølge
    map.on("click", select);
    map.on("click", selectPoint);
    map.addInteraction(dragPan);
    map.addInteraction(modify);
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
  }, [dragPan, dragZoom, modify, select, selectPoint, activeModeTools, activeTool]);
};

export default useInteractions;
