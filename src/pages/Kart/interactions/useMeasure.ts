import { useEffect, useRef, useMemo } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { Overlay, MapBrowserEvent } from "ol";
import { unByKey } from "ol/Observable";
import { getLength } from "ol/sphere";
import { LineString } from "ol/geom";
import { Style, Stroke } from "ol/style";
import { map } from "../constants";
import { EventsKey } from "ol/events";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { noModifierKeys } from "ol/events/condition";
import { ModeTool, Tool, useToolbar } from "contexts/ToolbarContext";
import { pixelTolerance } from "./constants";

let measureIdCounter = 0;
function generateMeasureFeatureId() {
  measureIdCounter++;
  return `measure-feature-${measureIdCounter}`;
}

// ------- Hjelpefunksjoner -------- //

// Opprett tooltip-element (<div>) med ønsket tekst/stil
function createTooltipElement(text: string, style: React.CSSProperties) {
  const el = document.createElement("div");
  el.innerHTML = text;
  Object.assign(el.style, style);
  return el;
}

// Opprett et Overlay gitt et element + konfigurasjon
function createOverlay(
  element: HTMLElement,
  offset: [number, number],
  positioning: "center-left" | "center-right" | "bottom-center",
  stopEvent = false,
) {
  return new Overlay({
    element,
    offset,
    positioning,
    stopEvent,
  });
}

// Oppdaterer tooltip-element og overlay-posisjon
function updateTooltip(
  tooltipElement: HTMLDivElement | null,
  tooltipOverlay: Overlay | null,
  text: string,
  coordinate: number[] | null,
) {
  if (!tooltipElement || !tooltipOverlay || !coordinate) {
    return;
  }
  tooltipElement.innerHTML = text;
  tooltipOverlay.setPosition(coordinate);
}

function formatLength(line: LineString): string {
  const length = getLength(line);
  let output: string;
  if (length > 1000) {
    output = (length / 1000).toFixed(2) + " km";
  } else {
    output = length.toFixed(2) + " m";
  }
  return output;
}

const helpMsg = "Klikk for å starte en ny måling";

const tooltipStyle = {
  background: "rgba(0, 0, 0, 0.7)",
  color: "#fff",
  padding: "5px 10px",
  borderRadius: "4px",
  fontSize: "14px",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
};

// ------- useMeasure hooken -------- //
const useMeasure = () => {
  const { activeTool, activeModeTools } = useToolbar();

  // refs for å unngå re-render loops:
  const activeToolRef = useRef<Tool | null>(null);
  const activeModeToolsRef = useRef<ModeTool[]>([]);

  useEffect(() => {
    activeToolRef.current = activeTool;
    activeModeToolsRef.current = activeModeTools;
  }, [activeTool, activeModeTools]);

  const measureSource = useMemo(() => new VectorSource(), []);
  // measureLayer (den oppmålte linjen etter drawend)
  const measureLayer = useMemo(() => {
    return new VectorLayer({
      source: measureSource,
      style: new Style({
        stroke: new Stroke({
          lineDash: [10, 10],
          color: "#000000",
          width: 2,
        }),
      }),
    });
  }, [measureSource]);
  const measureInteraction = useMemo(() => {
    return new Draw({
      source: measureSource,
      type: "LineString",
      snapTolerance: pixelTolerance,
      style: new Style({
        stroke: new Stroke({
          lineDash: [10, 10],
          color: "#000000",
          width: 2,
        }),
      }),
      stopClick: true,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        const currentTool = activeToolRef.current;
        const currentModeTools = activeModeToolsRef.current;
        if (!noModifierKeys(event) || currentTool !== "measure" || currentModeTools.includes("move")) {
          return false;
        }
        return true;
      },
    });
  }, [measureSource]);

  // Overlays for tooltips (refs for å unngå re-renders)
  const helpTooltipElement = useRef<HTMLDivElement | null>(null);
  const measureTooltipElement = useRef<HTMLDivElement | null>(null);
  const helpTooltipRef = useRef<Overlay | null>(null);
  const measureTooltipRef = useRef<Overlay | null>(null);

  const pointerMoveListenerRef = useRef<EventsKey | EventsKey[] | null>(null);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    if (activeTool === "measure") {
      // Legg til layer + interaction
      if (!map.getLayers().getArray().includes(measureLayer)) {
        map.addLayer(measureLayer);
      }
      if (!map.getInteractions().getArray().includes(measureInteraction)) {
        map.addInteraction(measureInteraction);
      }

      // 1) Oppretter helpTooltip-element og overlay om det ikke finnes
      if (!helpTooltipElement.current && !helpTooltipRef.current) {
        helpTooltipElement.current = createTooltipElement(helpMsg, tooltipStyle);
        helpTooltipRef.current = createOverlay(helpTooltipElement.current, [15, 0], "center-left");
        map.addOverlay(helpTooltipRef.current);
      }

      // 2) Oppretter measureTooltip-element og overlay om det ikke finnes
      if (!measureTooltipElement.current && !measureTooltipRef.current) {
        measureTooltipElement.current = createTooltipElement("", tooltipStyle);
        measureTooltipRef.current = createOverlay(measureTooltipElement.current, [0, -15], "bottom-center", false);
        map.addOverlay(measureTooltipRef.current);
      }

      const pointerMoveHandler = (evt: MapBrowserEvent<UIEvent>) => {
        if (evt.dragging) {
          return;
        }

        if (isDrawing.current) {
          // Skjul helpTooltip under oppmåling
          if (helpTooltipRef.current) {
            helpTooltipRef.current.setPosition(undefined);
          }
        } else {
          // Oppdater helpTooltip med "Klikk for å starte en ny måling"
          updateTooltip(helpTooltipElement.current, helpTooltipRef.current, helpMsg, evt.coordinate);
        }
      };

      if (!pointerMoveListenerRef.current) {
        pointerMoveListenerRef.current = map.on("pointermove", pointerMoveHandler);
      }

      // 4) drawstart
      const onDrawStart = (evt: DrawEvent) => {
        measureSource.clear(); // Nullstill forrige måling
        const geom = evt.feature.getGeometry() as LineString;

        geom.on("change", () => {
          // Oppdaterer tooltip med lengde for hver endring i geometrien
          const output = formatLength(geom);
          isDrawing.current = true;
          updateTooltip(measureTooltipElement.current, measureTooltipRef.current, output, geom.getLastCoordinate());
        });
      };

      // 5) drawend
      const onDrawEnd = (evt: DrawEvent) => {
        isDrawing.current = false;
        const measureId = generateMeasureFeatureId();
        evt.feature.setId(measureId);
      };

      measureInteraction.on("drawstart", onDrawStart);
      measureInteraction.on("drawend", onDrawEnd);

      // Cleanup
      return () => {
        isDrawing.current = false;
        measureInteraction.un("drawstart", onDrawStart);
        measureInteraction.un("drawend", onDrawEnd);

        if (map.getInteractions().getArray().includes(measureInteraction)) {
          map.removeInteraction(measureInteraction);
        }
        if (map.getLayers().getArray().includes(measureLayer)) {
          map.removeLayer(measureLayer);
        }
        measureSource.clear();

        // Fjern overlays
        if (helpTooltipRef.current) {
          map.removeOverlay(helpTooltipRef.current);
          helpTooltipRef.current = null;
        }
        if (measureTooltipRef.current) {
          map.removeOverlay(measureTooltipRef.current);
          measureTooltipRef.current = null;
        }

        if (pointerMoveListenerRef.current) {
          unByKey(pointerMoveListenerRef.current);
          pointerMoveListenerRef.current = null;
        }

        // Nullstill tooltip-elementer
        helpTooltipElement.current = null;
        measureTooltipElement.current = null;
      };
    }
  }, [activeTool, measureInteraction, measureLayer, measureSource]);

  return { measureInteraction };
};

export default useMeasure;
