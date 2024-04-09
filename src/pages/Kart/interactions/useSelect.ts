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
  const { selectFeatures, selectedFeatures, clearSelection, featureIsArchived } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const previousPointMode = usePrevious(activeTool);
  const { getActiveFeaturesAtPixel } = useGetFeatures();

  const disallowedTools: Tool[] = ["draw", "koordinater"];
  const safeTools: Tool[] = ["grenseinfo"];

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
      const filteredFeatures = getActiveFeaturesAtPixel(event, safeTools.includes(activeTool) ? null : "edit");

      if (filteredFeatures.length === 0) {
        overlayPopup.setPosition(undefined);
        closeOverlayPanel();
        clearSelection();
        event.stopPropagation();
        return;
      }

      // Stopp tidlig dersom man klikker på de samme featurene på nytt
      if (
        selectedFeatures.length === filteredFeatures.length &&
        selectedFeatures.every((sf) => filteredFeatures.some((ff) => sf.getId() === ff.getId()))
      ) {
        return;
      }

      const clickedFeature = filteredFeatures[0];

      // I noen verktøy skal man ikke kunne velge ikke-redigerbare grenser
      if (!safeTools.includes(activeTool) && !isFeatureEditable(clickedFeature, featureIsArchived(clickedFeature))) {
        toast({ status: "error", title: "Denne grensen er ikke redigerbar" });
        event.stopPropagation();
        return;
      }

      if (activeTool === "split") {
        // Dersom featuren vi vil splitte er for liten skal vi ikke velge den
        const geometry = clickedFeature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();
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

      selectFeatures(filteredFeatures);
    }
  };

  return { select };
};

export default useSelect;
