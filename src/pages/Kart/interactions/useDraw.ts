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
import { findNearbyVertexOnFeature } from "utils/map";
import { useGetFeatures } from "./utils";

const useDraw = () => {
  const { activeTool } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const { openOverlayPanel } = useOverlayPanel();
  const { selectFeatures, selectedFeatures } = useFeatureStyle();
  const { getActiveFeaturesAtPixel, coordinatesAreEqual } = useGetFeatures();
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
        condition: (event: MapBrowserEvent<MouseEvent>) => {
          if (!noModifierKeys(event) || activeTool !== "draw") return false;

          const featuresAtPixel = getActiveFeaturesAtPixel(event, "edit");

          if (featuresAtPixel.length === 0) return true;

          let isAllowedOperation = true;

          for (const featureLike of featuresAtPixel) {
            const feature = featureLike as Feature<LineString>;
            const geometry = feature.getGeometry();

            if (!geometry) continue;

            const firstCoordinate = geometry.getFirstCoordinate();
            const lastCoordinate = geometry.getLastCoordinate();

            const clickedCoordinate = findNearbyVertexOnFeature(
              feature,
              event.coordinate,
            );

            if (!clickedCoordinate) {
              isAllowedOperation = false;
              break;
            }

            const pointOnFeature = geometry.getClosestPoint(clickedCoordinate);

            if (
              !coordinatesAreEqual(pointOnFeature, firstCoordinate) &&
              !coordinatesAreEqual(pointOnFeature, lastCoordinate)
            ) {
              isAllowedOperation = false;
              break;
            }
          }

          if (!isAllowedOperation) {
            toast({
              status: "warning",
              title:
                "Nye grensepunkter kan kun plasseres på en eksisterende grenses endepunkter",
            });
            return false;
          }

          return true;
        },
        finishCondition: (event: MapBrowserEvent<MouseEvent>) => {
          return true;
        },
      }),
    [activeTool, coordinatesAreEqual, getActiveFeaturesAtPixel, toast],
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
    toast,
  ]);

  return { draw };
};

export default useDraw;
