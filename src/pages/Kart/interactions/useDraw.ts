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
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { findNearbyVertexOnFeature } from "utils/map";
import { useGetFeatures } from "./utils";
import { FeatureLike } from "ol/Feature";
import { Coordinate, equals } from "ol/coordinate";
import { setDefaultFeatureProperties } from "utils/features";
import { map } from "../constants";

const useDraw = () => {
  const { activeTool, activeModeTools } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const { openOverlayPanel } = useOverlayPanel();
  const { selectFeatures, selectedFeatures } = useFeatureStyle();
  const { getActiveFeaturesAtPixel } = useGetFeatures();
  const toast = useToast();

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const draw = useMemo(() => {
    const isAllowedDrawOperationOnFeature = (featureLike: FeatureLike, eventCoordinate: Coordinate): boolean => {
      const feature = featureLike as Feature<LineString>;
      const geometry = feature.getGeometry();

      if (!geometry) return true;

      const firstCoordinate = geometry.getFirstCoordinate();
      const lastCoordinate = geometry.getLastCoordinate();

      const clickedCoordinate = findNearbyVertexOnFeature(feature.getGeometry() as LineString, eventCoordinate);

      if (!clickedCoordinate) {
        return false;
      }

      const pointOnFeature = geometry.getClosestPoint(clickedCoordinate);

      if (!equals(pointOnFeature, firstCoordinate) && !equals(pointOnFeature, lastCoordinate)) {
        return false;
      }

      return true;
    };

    return new Draw({
      type: "LineString",
      source: editSource,
      snapTolerance: pixelTolerance,
      style: grenseStyles.select,
      freehandCondition: () => false,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        if (!noModifierKeys(event) || activeTool !== "draw" || activeModeTools.includes("move")) return false;

        const featuresAtPixel = getActiveFeaturesAtPixel(event, "edit");

        // Legg til feature hvis vi ikke treffer noen andre features
        if (featuresAtPixel.length === 0) {
          draw.changed();
          return true;
        }

        // Hvis vi treffer andre features, må vi sjekke om det er et endepunkt
        const isAllowedOperation = featuresAtPixel.every((featureLike) =>
          isAllowedDrawOperationOnFeature(featureLike, event.coordinate),
        );

        if (!isAllowedOperation) {
          toast({
            status: "warning",
            title: "Nye grensepunkter kan kun plasseres på en eksisterende grenses endepunkter",
          });
          return false;
        }

        // Vi ønsker å avslutte tegningen hvis man har startet en tegning, og så treffer et endepunkt, så vi unngår rar geometri
        // Dette gjøres ved å bumpe et versjonstall med draw.changed() hvis denne conditionen returnerer true. Hvis versjonen da er høyere
        // enn null (som den blir av første endring), vil vi avslutte tegningen
        if (draw.getRevision() > 0) {
          draw.appendCoordinates([event.coordinate]);
          draw.finishDrawing();
          return false;
        }

        draw.changed();
        return true;
      },
    });
  }, [activeTool, getActiveFeaturesAtPixel, toast, activeModeTools]);

  useEffect(() => {
    const addDrawToHistory = (drawnFeature: Feature<LineString>) => {
      const editingType = getCurrentlyEditingType();
      if (!editingType) return;

      const grenseType = getGrenseTypeFromEditingType(editingType);

      if (drawnFeature && grenseType) {
        addHistoryEntry({
          type: "nygrense",
          changes: createNyGrenseHistoryChanges([drawnFeature], grenseType),
        });
      }
    };

    const onDrawEnd = (e: DrawEvent) => {
      const drawnFeature = e.feature as Feature<LineString>;
      const editingType = getCurrentlyEditingType();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (!editingType) return;

      drawnFeature.setId(getTempFeatureId());
      setDefaultFeatureProperties(drawnFeature, getGrenseTypeFromEditingType(editingType));

      addDrawToHistory(drawnFeature);

      toast({
        status: "success",
        title: "Grensen ble lagt til i kartet",
        description: "Grense lagt til med standardmetadata. Husk at du må sette tilhørighet på nye grenser.",
      });

      openOverlayPanel("grenseinfo");
      selectFeatures([drawnFeature]);
      // TODO: bruk isFeatureDeadEnd for å avgjøre om den nye grensen danner en lukket flate

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };

    draw.on("drawend", onDrawEnd);
    return () => {
      draw.un("drawend", onDrawEnd);
    };
  }, [addHistoryEntry, draw, getCurrentlyEditingType, openOverlayPanel, selectFeatures, selectedFeatures, toast]);

  useEffect(() => {
    const mapViewport = map.getViewport();

    const handleMouseMove = () => {
      mapViewport.style.cursor = "crosshair";
    };

    if (activeTool == "draw" && !activeModeTools.includes("move")) {
      map.on("pointermove", handleMouseMove);
    } else {
      mapViewport.style.cursor = "";
    }

    return () => {
      map.un("pointermove", handleMouseMove);
      mapViewport.style.cursor = "";
    };
  }, [activeModeTools, activeTool]);

  return { draw };
};

export default useDraw;
