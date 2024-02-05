import { Tool, useToolbar } from "contexts/ToolbarContext";
import { Feature, MapBrowserEvent } from "ol";
import { overlayPopup } from "../constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToast } from "@kvib/react";
import { useEffect } from "react";
import { usePrevious } from "hooks/usePrevious";
import { useGetFeatures } from "./utils";
import useFeature from "hooks/useFeature";

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
  const { featureIsEditable } = useFeature();
  const { activeOverlayPanel, closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const previousPointMode = usePrevious(activeTool);
  const { getActiveFeaturesAtPixel } = useGetFeatures();

  const dangerousPointModes: Tool[] = ["archive", "split", "detach"];
  const allowedPointModes: Tool[] = [...dangerousPointModes, "metadata"];

  // Dersom man bytter verktøy ønsker vi å cleare selection
  useEffect(() => {
    if (activeTool !== previousPointMode && selectedFeatures.length > 0) {
      clearSelection();
      if (activeOverlayPanel === "metadata") {
        closeOverlayPanel();
      }
    }
  }, [activeOverlayPanel, activeTool, clearSelection, closeOverlayPanel, previousPointMode, selectedFeatures.length]);

  const select = (event: MapBrowserEvent<MouseEvent>) => {
    if (allowedPointModes.includes(activeTool) && !event.dragging) {
      // Henter features og filtrerer ut den blå prikken som indikerer hva man trykker på
      const filteredFeatures = getActiveFeaturesAtPixel(event, null);

      if (filteredFeatures.length === 0) {
        overlayPopup.setPosition(undefined);
        closeOverlayPanel();
        clearSelection();
        event.stopPropagation();
        return;
      }

      const clickedFeature = filteredFeatures[0] as Feature<LineString>;

      // I noen verktøy skal man ikke kunne velge ikke-redigerbare grenser
      if (
        dangerousPointModes.includes(activeTool) &&
        !featureIsEditable(clickedFeature, featureIsArchived(clickedFeature))
      ) {
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

      if (activeTool === "metadata") {
        // Dersom den valgte grensen er en WFS-grense skal vi vise et eget panel for det
        if (clickedFeature?.getId()?.toString().includes("TEIGGRENSEWFS")) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("metadata");
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
      }

      selectFeatures([clickedFeature]);

      // Vi tar denne til slutt da vi noen ganger ønsker å returnere tidlig og la eventet propagere
      // f.eks. ønsker vi at split skal både kunne gjøre select og selectPoint
      event.stopPropagation();
    }
  };

  return { select };
};

export default useSelect;
