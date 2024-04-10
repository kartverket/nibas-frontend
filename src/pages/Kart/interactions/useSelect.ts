import { Tool, useToolbar } from "contexts/ToolbarContext";
import { Feature, MapBrowserEvent } from "ol";
import { overlayPopup } from "../constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToast } from "@kvib/react";
import { useEffect } from "react";
import { usePrevious } from "hooks/usePrevious";
import { useGetFeatures } from "./interaction-utils";
import { isFeatureEditable, isMatrikkelFeature } from "utils/features";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];
  if (coordinates.length < 2) return;
  const middle = Math.floor((coordinates.length - 1) / 2);
  return coordinates[middle];
};

const useSelect = () => {
  const toast = useToast();
  const { activeTool } = useToolbar();
  const {
    selectFeatures,
    selectedFeatures,
    clearSelection,
    featureIsArchived,
    addToSelection,
    removeFromSelection,
    isSelectedFeature,
  } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const previousPointMode = usePrevious(activeTool);
  const { getLineStringFeaturesAtPixel } = useGetFeatures();

  const disallowedTools: Tool[] = ["draw", "koordinater"];
  const safeTools: Tool[] = ["grenseinfo"];
  const pointModes: Tool[] = ["add", "remove", "split"];

  // Dersom man bytter verktøy ønsker vi å cleare selection
  useEffect(() => {
    if (activeTool !== previousPointMode && selectedFeatures.length > 0) {
      clearSelection();
      if (activeOverlayPanel === "grenseinfo") {
        closeOverlayPanel();
      }
    }
  }, [activeOverlayPanel, activeTool, clearSelection, closeOverlayPanel, previousPointMode, selectedFeatures.length]);

  const select = (event: MapBrowserEvent<MouseEvent>) => {
    if (!disallowedTools.includes(activeTool) && !event.dragging) {
      const activeFeatures = getLineStringFeaturesAtPixel(event, safeTools.includes(activeTool) ? null : "edit");

      // Dersom man har klikket på kartet skal vi kvitte oss med selection
      if (activeFeatures.length === 0) {
        overlayPopup.setPosition(undefined);
        closeOverlayPanel();
        clearSelection();
        event.stopPropagation();
        return;
      }

      // Vi velger kun én feature om gangen
      const clickedFeature = activeFeatures[0];

      // Hvis feature allerede er valgt skal den de-selectes
      if (!pointModes.includes(activeTool) && isSelectedFeature(clickedFeature)) {
        removeFromSelection(clickedFeature);
        event.stopPropagation();
        return;
      }

      // I noen verktøy skal man ikke kunne velge ikke-redigerbare grenser
      if (!safeTools.includes(activeTool) && !isFeatureEditable(clickedFeature, featureIsArchived(clickedFeature))) {
        toast({ status: "error", title: "Denne grensen er ikke redigerbar" });
        event.stopPropagation();
        return;
      }

      if (activeTool === "split") {
        // Dersom featuren vi vil splitte er for liten skal vi ikke velge den
        const geometry = clickedFeature.getGeometry();
        const coordinates = geometry?.getCoordinates() ?? [];
        if (coordinates.length <= 2) {
          toast({
            status: "error",
            title: "Grensen er for liten til å splittes",
          });
          event.stopPropagation();
          return;
        }

        // Dersom vi er i split-modus og allerede har valgt denne grensen
        if (selectedFeatures.length === 1 && clickedFeature.getId() === selectedFeatures[0].getId()) {
          // ...ønsker vi å returnere tidlig og la eventet propagere til selectPoint
          return;
        }
      }

      if (activeTool === "grenseinfo") {
        // Dersom den valgte grensen er en WFS-grense skal vi vise et eget panel for det
        if (isMatrikkelFeature(clickedFeature)) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("grenseinfo");
        }
      }

      if (activeTool === "archive") {
        if (featureIsArchived(clickedFeature)) {
          toast({
            status: "error",
            title: "Kan ikke arkivere grenser som allerede er arkivert",
          });
          event.stopPropagation();
          return;
        }

        const newSelectedFeatures = selectedFeatures.concat(clickedFeature);
        selectFeatures(newSelectedFeatures);

        event.stopPropagation();
        return;
      }

      addToSelection(clickedFeature);
    }
  };

  return { select };
};

export default useSelect;
