import { Feature, MapBrowserEvent } from "ol";
import { map } from "../constants";
import { getLayerById } from "utils/map/layers";
import { pixelTolerance } from "./constants";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect, useMemo } from "react";
import { findNearbyVertexOnFeature } from "utils/map";
import { useToast } from "@kvib/react";
import { coordinatesAreEqual } from "./utils";

const useSelectPoint = () => {
  const toast = useToast();
  const { activeTool } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();
  const {
    selectPointOnFeature,
    selectedPoint,
    clearSelection,
    featureIsEditable,
  } = useFeatureStyle();

  const allowedPointModes: Tool[] = useMemo(
    () => ["koordinater", "split", "extend"],
    [],
  );

  // Dersom man har byttet verktøy ønsker vi å tilbakestille punktet
  useEffect(() => {
    if (selectedPoint && !allowedPointModes.includes(activeTool)) {
      clearSelection();

      if (activeOverlayPanel === "koordinater") {
        closeOverlayPanel();
      }
    }
  }, [
    activeOverlayPanel,
    activeTool,
    allowedPointModes,
    clearSelection,
    closeOverlayPanel,
    selectedPoint,
  ]);

  const selectPoint = (event: MapBrowserEvent<MouseEvent>) => {
    if (allowedPointModes.includes(activeTool) && !event.dragging) {
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
      if (features.every(featureIsEditable)) {
        // Må estimere hvilket punkt på linjen man prøvde å trykke på
        const nearbyVertexCoordinate = findNearbyVertexOnFeature(
          features[0] as Feature<LineString>,
          event.coordinate,
        );

        if (nearbyVertexCoordinate) {
          if (activeTool === "split" && features.length > 1) {
            toast({
              status: "error",
              title: "Man kan ikke splitte på et endepunkt",
            });
            return;
          }

          if (activeTool === "extend") {
            const featureGeometry = features[0].getGeometry() as LineString;
            const pointOnFeature = featureGeometry.getClosestPoint(
              nearbyVertexCoordinate,
            );

            if (
              !coordinatesAreEqual(
                featureGeometry.getFirstCoordinate(),
                pointOnFeature,
              ) &&
              !coordinatesAreEqual(
                featureGeometry.getLastCoordinate(),
                pointOnFeature,
              )
            ) {
              toast({
                status: "error",
                title: "Man må utvide fra et løsrevet endepunkt",
              });
              return;
            }
          }

          selectPointOnFeature(
            nearbyVertexCoordinate,
            features as Feature<LineString>[],
          );

          if (activeTool === "koordinater") {
            openOverlayPanel("koordinater");
          }
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
