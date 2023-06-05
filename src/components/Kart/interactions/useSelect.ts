import { useEffect, useMemo } from "react";
import { Feature } from "ol";
import { Select } from "ol/interaction";
import LineString from "ol/geom/LineString";
import { overlayPopup } from "components/Kart/constants";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useHistory } from "contexts/HistoryContext";
import { grenseStyles } from "utils/map/layerStyles";
import { pixelTolerance } from "./constants";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

const useSelect = () => {
  const { activePointMode, dirtyFeatureIds } = useHistory();
  const {
    closeOverlayPanel,
    openOverlayPanel,
    selectedFeature,
    setSelectedFeature,
  } = useOverlayPanel();

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
        setSelectedFeature(clickedFeature);

        if (clickedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("metadata");
        }
      } else if (clickedFeatures.length === 0) {
        if (dirtyFeatureIds.includes(selectedFeature?.getId() as string)) {
          selectedFeature?.setStyle(grenseStyles.dirty);
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
    selectedFeature,
    setSelectedFeature,
  ]);

  useEffect(() => {
    if (selectedFeature === null) {
      select.getFeatures().clear();
    }
  }, [select, selectedFeature]);

  return { select };
};

export default useSelect;
