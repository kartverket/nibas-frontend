import { useEffect, useMemo } from "react";
import { Feature } from "ol";
import { Select } from "ol/interaction";
import LineString from "ol/geom/LineString";
import { squaredDistance } from "ol/coordinate";
import { SelectEvent } from "ol/interaction/Select";
import { overlayPopup } from "components/Kart/constants";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { grenseStyles } from "utils/map/layerStyles";
import { pixelTolerance } from "./constants";
import { editableBorderTypes } from "hooks/layers/constants";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

const useSelectInteraction = () => {
  const { activePointMode, dirtyFeatureIds } = useToolbar();
  const {
    closeOverlayPanel,
    openOverlayPanel,
    selectedFeature,
    setSelectedFeature,
    setPunktKoordinater,
  } = useOverlayPanel();

  const select = useMemo(
    () =>
      new Select({
        hitTolerance: pixelTolerance,
        style: grenseStyles.select,
        filter: (feature) => {
          if (activePointMode === "metadata") {
            return feature.getGeometry() instanceof LineString;
          } else if (activePointMode === "koordinater") {
            return (
              feature.getGeometry() instanceof LineString &&
              editableBorderTypes.includes(feature.get("type"))
            );
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
    // TODO: select event kan ikke kjøres to ganger på samme feature på rad
    // må altså lytte på map click og gjøre select-logikken manuelt for å kunne velge annet punkt på samme feature
    // eventuelt kan vi tegne punkter som egen geometri og velge dem i stedet
    const syncFeatures = (event: SelectEvent) => {
      const clickedFeatures = select.getFeatures().getArray().slice();

      if (clickedFeatures.length === 1) {
        const clickedFeature = clickedFeatures[0];
        setSelectedFeature(clickedFeature);

        if (clickedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
          overlayPopup.setPosition(getOverlayPosition(clickedFeature));
        } else if (activePointMode === "metadata") {
          overlayPopup.setPosition(undefined);
          openOverlayPanel("metadata");
        } else if (activePointMode === "koordinater") {
          overlayPopup.setPosition(undefined);

          // Punkter på en LineString har ikke egen geometri
          const geometry = clickedFeature.getGeometry() as LineString;
          const coordinates = geometry.getCoordinates();

          // Må estimere hvilket punkt på linjen man prøvde å trykke på
          const coordinatesWithDistanceToClick = coordinates.map((coord) => [
            ...coord,
            squaredDistance(coord, event.mapBrowserEvent.coordinate),
          ]);
          const nearestVertexCoordinates = coordinatesWithDistanceToClick
            .sort((a, b) => a[2] - b[2])
            .map((cwd) => cwd.slice(0, -1))[0];
          setPunktKoordinater([
            nearestVertexCoordinates[0],
            nearestVertexCoordinates[1],
          ]);
          openOverlayPanel("koordinater");
        }
      } else if (clickedFeatures.length === 0) {
        if (dirtyFeatureIds.includes(selectedFeature?.getId() as string)) {
          selectedFeature?.setStyle(grenseStyles.dirty);
        }
        closeOverlayPanel();
        overlayPopup.setPosition(undefined);
      }
    };

    select.on("select", syncFeatures);

    return () => {
      select.un("select", syncFeatures);
    };
  }, [
    activePointMode,
    closeOverlayPanel,
    dirtyFeatureIds,
    openOverlayPanel,
    select,
    selectedFeature,
    setPunktKoordinater,
    setSelectedFeature,
  ]);

  useEffect(() => {
    if (selectedFeature === null) {
      select.getFeatures().clear();
    }
  }, [select, selectedFeature]);

  return { select };
};

export default useSelectInteraction;
