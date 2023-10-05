import { Feature, MapBrowserEvent } from "ol";
import { map } from "../constants";
import { getLayerById } from "utils/map/layers";
import { pixelTolerance } from "./constants";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { ToolbarPointMode, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect, useMemo } from "react";
import { borderIsEditable, findNearestVertexOnFeature } from "utils/map";
import { useToast } from "@kvib/react";

const useSelectPoint = () => {
  const toast = useToast();
  const { activePointMode } = useToolbar();
  const { openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedPoint, clearSelection } =
    useFeatureStyle();

  const allowedPointModes: ToolbarPointMode[] = useMemo(
    () => ["koordinater", "split"],
    []
  );

  // Dersom man har byttet verktøy ønsker vi å tilbakestille punktet
  useEffect(() => {
    if (selectedPoint && !allowedPointModes.includes(activePointMode)) {
      clearSelection();
      closeOverlayPanel();
    }
  }, [
    activePointMode,
    allowedPointModes,
    clearSelection,
    closeOverlayPanel,
    selectedPoint,
  ]);

  const selectPoint = (event: MapBrowserEvent<MouseEvent>) => {
    if (allowedPointModes.includes(activePointMode) && !event.dragging) {
      event.stopPropagation();

      const editLayer = getLayerById("edit");
      const features = map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === editLayer,
        hitTolerance: pixelTolerance,
      });

      if (features.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
      if (features.every(borderIsEditable)) {
        // Må estimere hvilket punkt på linjen man prøvde å trykke på
        const nearestVertexCoordinate = findNearestVertexOnFeature(
          features[0] as Feature<LineString>,
          event.coordinate
        );

        selectPointOnFeature(
          nearestVertexCoordinate,
          features as Feature<LineString>[]
        );

        if (activePointMode === "koordinater") {
          openOverlayPanel("koordinater");
        }
      } else {
        toast({
          status: "error",
          title: "Denne grensen er ikke redigerbar",
        });
      }
    }
  };

  return { selectPoint };
};

export default useSelectPoint;
