import { useEffect, useMemo } from "react";
import { Feature } from "ol";
import { Select } from "ol/interaction";
import LineString from "ol/geom/LineString";
import { overlayPopup } from "components/Kart/constants";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { grenseStyles } from "utils/map/layerStyles";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

const useSelect = () => {
  const { dirtyFeatureIds } = useFeatureStyle();
  const { activePointMode } = useToolbar();
  const { closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const { selectedFeatures, setSelectedFeatures } = useFeatureStyle();

  // TODO: skriv vekk fra Select da vi stadig får bugs fra måten den resetter stil
  const select = useMemo(
    () =>
      new Select({
        hitTolerance: pixelTolerance,
        style: grenseStyles.select,
        filter: (feature) => {
          if (activePointMode === "metadata") {
            return feature.getGeometry() instanceof LineString;
          }
          return false;
        },
        toggleCondition: () => {
          return false;
        },
      }),
    [activePointMode]
  );

  useEffect(() => {
    const syncFeatures = () => {
      const clickedFeatures = select.getFeatures().getArray().slice();

      if (clickedFeatures.length === 1) {
        const clickedFeature = clickedFeatures[0];
        setSelectedFeatures([clickedFeature]);

        if (clickedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("metadata");
        }
      } else if (clickedFeatures.length === 0) {
        for (const selectedFeature of selectedFeatures) {
          if (dirtyFeatureIds.includes(selectedFeature.getId() as string)) {
            selectedFeature.setStyle(grenseStyles.dirty);
          }
        }
        overlayPopup.setPosition(undefined);
        closeOverlayPanel();
      }
    };

    select.on("select", syncFeatures);

    return () => {
      select.un("select", syncFeatures);
    };
  }, [
    closeOverlayPanel,
    dirtyFeatureIds,
    openOverlayPanel,
    select,
    selectedFeatures,
    setSelectedFeatures,
  ]);

  // TODO: kan kuttes på sikt
  useEffect(() => {
    if (selectedFeatures.length === 0) {
      select.getFeatures().clear();
    }
  }, [select, selectedFeatures]);

  return { select };
};

export default useSelect;
