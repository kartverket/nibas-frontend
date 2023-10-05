import { ToolbarPointMode, useToolbar } from "contexts/ToolbarContext";
import { Feature, MapBrowserEvent } from "ol";
import { pixelTolerance } from "./constants";
import { map, overlayPopup } from "../constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { borderIsEditable } from "utils/map";
import { useToast } from "@kvib/react";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];
  if (coordinates.length < 2) return;
  const middle = Math.floor((coordinates.length - 1) / 2);
  return coordinates[middle];
};

const useSelect = () => {
  const toast = useToast();
  const { activePointMode } = useToolbar();
  const { selectFeatures, selectedFeatures, clearSelection } =
    useFeatureStyle();
  const { closeOverlayPanel, openOverlayPanel } = useOverlayPanel();

  const dangerousPointModes: ToolbarPointMode[] = [
    "archive",
    "split",
    "detach",
  ];
  const allowedPointModes: ToolbarPointMode[] = [
    ...dangerousPointModes,
    "metadata",
  ];

  const select = (event: MapBrowserEvent<MouseEvent>) => {
    if (allowedPointModes.includes(activePointMode) && !event.dragging) {
      const features = map.getFeaturesAtPixel(event.pixel, {
        hitTolerance: pixelTolerance,
      });

      // Filtrerer ut den blå prikken som indikerer hva man trykker på
      const filteredFeatures = features.filter(
        (feature) => feature.getGeometry() instanceof LineString
      );

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
        dangerousPointModes.includes(activePointMode) &&
        !borderIsEditable(clickedFeature)
      ) {
        toast({ status: "error", title: "Denne grensen er ikke redigerbar" });
        return;
      }

      // Dersom vi er i split-modus og allerede har valgt denne grensen
      if (
        activePointMode === "split" &&
        selectedFeatures.length === 1 &&
        clickedFeature.getId() === selectedFeatures[0].getId()
      ) {
        // ...ønsker vi å returnere tidlig og la eventet propagere til selectPoint
        return;
      }

      selectFeatures([clickedFeature]);

      if (activePointMode === "metadata") {
        if (clickedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("metadata");
        }
      }

      // Vi tar denne til slutt da vi noen ganger ønsker å returnere tidlig og la eventet propagere
      // f.eks. ønsker vi at split skal både kunne gjøre select og selectPoint
      event.stopPropagation();
    }
  };

  return { select };
};

export default useSelect;
