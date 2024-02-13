import { Feature, MapBrowserEvent } from "ol";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect, useMemo } from "react";
import { findNearbyVertexOnFeature } from "utils/map";
import { useToast } from "@kvib/react";
import { useGetFeatures } from "./utils";
import { isFeatureEditable } from "utils/features";

const useSelectPoint = () => {
  const toast = useToast();
  const { activeTool } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedPoint, clearSelection } = useFeatureStyle();
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

      const nonArchivedFeatures = getFeaturesAtPixel(event, "edit");
      const archivedFeatures = getFeaturesAtPixel(event, "archived");
      const allFeaturesAtPixel = nonArchivedFeatures.concat(archivedFeatures);

      if (allFeaturesAtPixel.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
      if (!nonArchivedFeatures.every((feature) => isFeatureEditable(feature, false))) {
        toast({
          status: "error",
          title: "Denne grensen er ikke redigerbar.",
        });
        return;
      }

      // Må estimere hvilket punkt på linjen man prøvde å trykke på
      const nearbyVertexCoordinate = findNearbyVertexOnFeature(
        nonArchivedFeatures[0] as Feature<LineString>,
        event.coordinate,
      );

      if (nearbyVertexCoordinate) {
        // Om man punktet har mer enn 1 ikke-arkivert feature betyr det at det er et endepunkt.
        if (activeTool === "split" && nonArchivedFeatures.length > 1) {
          toast({
            status: "error",
            title: "Man kan ikke dele grensen på et endepunkt",
          });
          return;
        }

        selectPointOnFeature(nearbyVertexCoordinate, nonArchivedFeatures as Feature<LineString>[]);

        if (activeTool === "koordinater") {
          openOverlayPanel("koordinater");
        }
      } else {
        if (activeTool === "split") {
          toast({
            status: "error",
            title: "Du kan kun dele grensen i et eksisterende grensepunkt ",
          });
          return;
        }
      }
    }
  };

  return { selectPoint };
};

export default useSelectPoint;
