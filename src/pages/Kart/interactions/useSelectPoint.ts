import { Feature, MapBrowserEvent } from "ol";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect, useMemo } from "react";
import { findNearbyVertexOnFeature } from "utils/map";
import { useToast } from "@kvib/react";
import { useGetFeatures } from "./utils";
import { featureIsArchived } from "utils/features";

const useSelectPoint = () => {
  const toast = useToast();
  const { activeTool } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedPoint, clearSelection, featureIsEditable } = useFeatureStyle();
  const { getFeaturesAtPixel } = useGetFeatures();

  const allowedPointModes: Tool[] = useMemo(() => ["koordinater", "split"], []);

  // Dersom man har byttet verktøy ønsker vi å tilbakestille punktet
  useEffect(() => {
    if (selectedPoint && !allowedPointModes.includes(activeTool)) {
      clearSelection();

      if (activeOverlayPanel === "koordinater") {
        closeOverlayPanel();
      }
    }
  }, [activeOverlayPanel, activeTool, allowedPointModes, clearSelection, closeOverlayPanel, selectedPoint]);

  const selectPoint = (event: MapBrowserEvent<MouseEvent>) => {
    if (allowedPointModes.includes(activeTool) && !event.dragging) {
      event.stopPropagation();

      const alleFeaturesPaaPixel = getFeaturesAtPixel(event, "edit");
      const ikkeArkiverteFeatures = alleFeaturesPaaPixel.filter((f) => !featureIsArchived(f));

      if (alleFeaturesPaaPixel.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      // Hvis alle features på punktet er arkiverte er den ikke redigerbar
      if (ikkeArkiverteFeatures.length === 0 && alleFeaturesPaaPixel.length > 0) {
        toast({
          status: "error",
          title: "Kan ikke redigere en arkivert grense",
        });
      } else if (ikkeArkiverteFeatures.every(featureIsEditable)) {
        // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
        // Må estimere hvilket punkt på linjen man prøvde å trykke på
        const nearbyVertexCoordinate = findNearbyVertexOnFeature(
          ikkeArkiverteFeatures[0] as Feature<LineString>,
          event.coordinate,
        );

        if (nearbyVertexCoordinate) {
          if (activeTool === "split" && ikkeArkiverteFeatures.length > 1) {
            toast({
              status: "error",
              title: "Man kan ikke splitte på et endepunkt",
            });
            return;
          }

          selectPointOnFeature(nearbyVertexCoordinate, ikkeArkiverteFeatures as Feature<LineString>[]);

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
