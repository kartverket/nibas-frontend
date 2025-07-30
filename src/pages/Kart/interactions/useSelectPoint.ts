import { useToast } from "@kvib/react";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { Feature, MapBrowserEvent } from "ol";
import LineString from "ol/geom/LineString";
import { useEffect, useMemo } from "react";
import { isFeatureEditable } from "utils/features";
import { findNearbyVertexOnFeature, pixelDistance } from "utils/map/map-utils";
import { pixelTolerance } from "./constants";
import { useGetFeatures } from "./interaction-utils";
import { isSplittingEditableGrense } from "./useSplit";

const useSelectPoint = () => {
  const toast = useToast();
  const { activeTool, activeModeTools } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedFeatures, selectedPoint, clearSelection } = useFeatureStyle();
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

  const selectPoint = (event: MapBrowserEvent<PointerEvent>) => {
    if (!activeModeTools.includes("move") && allowedPointModes.includes(activeTool) && !event.dragging) {
      event.stopPropagation();

      const archivedFeatures = getFeaturesAtPixel(event, ["archived"]);
      const nonArchivedFeatures = getFeaturesAtPixel(event, ["edit"]);

      if (archivedFeatures.length === 0 && nonArchivedFeatures.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      if (activeTool === "split" && selectedPoint) {
        const selectedCoord = selectedPoint.getGeometry()?.getCoordinates();
        if (selectedCoord && pixelDistance(event.coordinate, selectedCoord) < pixelTolerance) {
          toast({
            status: "info",
            title: "Dette punktet er allerede valgt for deling. Trykk 'Del grense' i panelet for å dele grensen.",
          });
          return;
        }
      }

      // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
      if (
        !nonArchivedFeatures.every(
          (feature) => isFeatureEditable(feature) || isSplittingEditableGrense(feature, activeTool),
        )
      ) {
        toast({
          status: "error",
          title: "Denne grensen er ikke redigerbar.",
        });
        return;
      }

      // Må estimere hvilket punkt på linjen man prøvde å trykke på
      const nearbyVertexCoordinate = findNearbyVertexOnFeature(
        nonArchivedFeatures[0].getGeometry() as LineString,
        event.coordinate,
      );

      if (nearbyVertexCoordinate) {
        // Om punktet har mer enn 1 ikke-arkivert feature betyr det at det er et endepunkt.
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
        if (activeTool === "split" && selectedFeatures.length > 0) {
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
