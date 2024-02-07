import { Feature, MapBrowserEvent } from "ol";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect, useMemo } from "react";
import { findNearbyVertexOnFeature } from "utils/map";
import { useToast } from "@kvib/react";
import { useGetFeatures } from "./utils";

const useSelectPoint = () => {
  const toast = useToast();
  const { activeTool } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedPoint, clearSelection, featureIsEditable, featureIsArchived } =
    useFeatureStyle();
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

      const allFeaturesAtPixel = getFeaturesAtPixel(event, "edit");
      const ikkeArkiverteFeatures = allFeaturesAtPixel.filter((f) => !featureIsArchived(f));

      if (allFeaturesAtPixel.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      // Hvis alle features på punktet er arkiverte er den ikke redigerbar
      if (ikkeArkiverteFeatures.length === 0 && allFeaturesAtPixel.length > 0) {
        toast({
          status: "error",
          title: "Kan ikke redigere en arkivert grense",
        });
        return;
      }

      // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
      if (!ikkeArkiverteFeatures.every(featureIsEditable)) {
        toast({
          status: "error",
          title: "Denne grensen er ikke redigerbar",
        });
        return;
      }

      // Må estimere hvilket punkt på linjen man prøvde å trykke på
      const nearbyVertexCoordinate = findNearbyVertexOnFeature(
        ikkeArkiverteFeatures[0] as Feature<LineString>,
        event.coordinate,
      );

      if (nearbyVertexCoordinate) {
        // Om man punktet har mer enn 1 ikke-arkivert feature betyr det at det er et endepunkt.
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
    }
  };

  return { selectPoint };
};

export default useSelectPoint;
