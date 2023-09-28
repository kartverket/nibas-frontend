import { useToolbar } from "contexts/ToolbarContext";
import { Feature, MapBrowserEvent } from "ol";
import { pixelTolerance } from "./constants";
import { map, overlayPopup } from "../constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];
  if (coordinates.length < 2) return;
  const middle = Math.floor((coordinates.length - 1) / 2);
  return coordinates[middle];
};

const useSelect = () => {
  const { activePointMode } = useToolbar();
  const { selectFeatures, clearSelection } = useFeatureStyle();
  const { closeOverlayPanel, openOverlayPanel } = useOverlayPanel();

  const select = (event: MapBrowserEvent<MouseEvent>) => {
    if (
      (activePointMode === "metadata" || activePointMode === "archive") &&
      !event.dragging
    ) {
      event.stopPropagation();

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
        return;
      }

      const clickedFeature = filteredFeatures[0] as Feature<LineString>;
      selectFeatures([clickedFeature]);
      if (activePointMode === "archive") {
        return;
      }
      if (clickedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
        overlayPopup.setPosition(getOverlayPosition(clickedFeature));
      } else {
        overlayPopup.setPosition(undefined);
        openOverlayPanel("metadata");
      }
    }
  };

  return { select };
};

export default useSelect;
