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
  const { activeTool, setIsDrawing } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const { openOverlayPanel } = useOverlayPanel();
  const { selectFeatures, selectedFeatures } = useFeatureStyle();
  const toast = useToast();

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const draw = useMemo(
    () =>
      new Draw({
        type: "LineString",
        source: editSource,
        snapTolerance: pixelTolerance,
        style: grenseStyles.select,
        freehandCondition: () => false,
        condition: (event: MapBrowserEvent<MouseEvent>) =>
          noModifierKeys(event) && activeTool === "draw",
      }),
    [activeTool],
  );

  useEffect(() => {
    const addDrawToHistory = (drawnFeature: Feature<LineString>) => {
      const editingType = getCurrentlyEditingType();
      if (!editingType) return;

      if (drawnFeature) {
        addHistoryEntry({
          type: "nygrense",
          changes: createNyGrenseHistoryChanges(
            [drawnFeature],
            getGrenseTypeFromEditingType(editingType) || undefined,
          ),
        });
      }
    };

    const onDrawEnd = (e: DrawEvent) => {
      setIsDrawing(false);

      const drawnFeature = e.feature as Feature<LineString>;
      const editingType = getCurrentlyEditingType();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (!editingType) return;

      drawnFeature.setId(getTempFeatureId());
      setDefaultFeatureProperties(
        drawnFeature,
        getGrenseTypeFromEditingType(editingType),
      );

      addDrawToHistory(drawnFeature);

      toast({
        status: "success",
        title: "Grensen ble lagt til i kartet",
        description:
          "Grense lagt til med standardmetadata. Husk at du må sette tilhørighet på nye grenser.",
      });

      openOverlayPanel("metadata");
      selectFeatures([drawnFeature as Feature<LineString>]);

      // Selected features is empty here, shouldn't be?
      console.log(selectedFeatures);

      e.stopPropagation();

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
    selectedFeatures,
    setIsDrawing,
    toast,
  ]);

  useEffect(() => {
    const onDrawStart = () => {
      setIsDrawing(true);
    };

    draw.on("drawstart", onDrawStart);
  }, [draw, setIsDrawing]);

  return { draw };
};

export default useDraw;
