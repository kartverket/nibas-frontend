import { useEffect, useMemo } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { noModifierKeys } from "ol/events/condition";
import { grenseStyles } from "utils/map/layerStyles";
import { editSource } from "hooks/layers/constants";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { getGrenseTypeFromEditingType } from "hooks/layers/types";
import { useToast } from "@kvib/react";
import { Feature, MapBrowserEvent } from "ol";
import { useHistory } from "contexts/HistoryContext";
import { getTempFeatureId } from "./tempFeatureIdUtil";
import { createNyGrenseHistoryChanges } from "./historyUtil";
import { setDefaultFeatureProperties } from "utils/features";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import LineString from "ol/geom/LineString";

const useDraw = () => {
  const { activeTool } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const { openOverlayPanel } = useOverlayPanel();
  const { selectFeatures } = useFeatureStyle();
  const toast = useToast();

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const draw = useMemo(
    () =>
      new Draw({
        type: "LineString",
        source: editSource,
        snapTolerance: pixelTolerance,
        style: grenseStyles.dirty,
        freehandCondition: () => false,
        condition: (event: MapBrowserEvent<MouseEvent>) => noModifierKeys(event) && activeTool === "draw",
      }),
    [activeTool],
  );

  useEffect(() => {
    const addDrawToHistory = (e: DrawEvent) => {
      const feature = e.feature;
      const editingType = getCurrentlyEditingType();
      if (!editingType) return;

      if (feature) {
        addHistoryEntry({
          type: "nygrense",
          changes: createNyGrenseHistoryChanges(
            [feature],
            getGrenseTypeFromEditingType(editingType) || undefined,
          ),
        });
      }
    };

    const onDrawEnd = (e: DrawEvent) => {
      const editingType = getCurrentlyEditingType();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (!editingType) return;

      e.feature.setId(getTempFeatureId());
      setDefaultFeatureProperties(
        e.feature,
        getGrenseTypeFromEditingType(editingType),
      );

      addDrawToHistory(e);

      toast({ status: "success", title: "Grensen ble lagt til i kartet" });

      selectFeatures([e.feature as Feature<LineString>]);
      openOverlayPanel("metadata");

      // TODO: bruk isFeatureDeadEnd for å avgjøre om den nye grensen danner en lukket flate

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };

    draw.on("drawend", onDrawEnd);
    return () => {
      draw.un("drawend", onDrawEnd);
    };
  }, [
    addHistoryEntry,
    draw,
    getCurrentlyEditingType,
    openOverlayPanel,
    selectFeatures,
    toast,
  ]);

  return { draw };
};

export default useDraw;
