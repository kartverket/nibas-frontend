import { Feature, MapBrowserEvent } from "ol";
import { map } from "../constants";
import { getLayerById } from "utils/map/layers";
import { pixelTolerance } from "./constants";
import LineString from "ol/geom/LineString";
import { squaredDistance } from "ol/coordinate";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { editableBorderTypes } from "hooks/layers/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { useEffect } from "react";

const useSelectPoint = () => {
  const { activePointMode } = useToolbar();
  const { openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectPointOnFeature, selectedPoint, clearSelection } =
    useFeatureStyle();

  // Dersom man har byttet verktøy ønsker vi å tilbakestille punktet
  useEffect(() => {
    if (selectedPoint && activePointMode !== "koordinater") {
      clearSelection();
      closeOverlayPanel();
    }
  }, [activePointMode, clearSelection, closeOverlayPanel, selectedPoint]);

  const selectPoint = (event: MapBrowserEvent<MouseEvent>) => {
    if (activePointMode === "koordinater" && !event.dragging) {
      event.stopPropagation();

      const editLayer = getLayerById("edit");
      const features = map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === editLayer,
        hitTolerance: pixelTolerance,
      });

      if (features.length === 0) {
        clearSelection();
        closeOverlayPanel();
        return;
      }

      // Valgt punkt kan ikke være en del av en ikke-redigerbar grense
      if (
        features.every((feature) =>
          editableBorderTypes.includes(feature.get("type"))
        )
      ) {
        // Hent punktkoordinatene fra en hvilken som helst av featurene
        const geometry = features[0].getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        // Må estimere hvilket punkt på linjen man prøvde å trykke på
        const coordinatesWithDistanceToClick = coordinates.map((coord) => ({
          coordinates: coord,
          distance: squaredDistance(coord, event.coordinate),
        }));
        const nearestVertexCoordinates = coordinatesWithDistanceToClick
          .sort((a, b) => a.distance - b.distance)
          .map((cwd) => cwd.coordinates)[0];

        selectPointOnFeature(
          nearestVertexCoordinates,
          features as Feature<LineString>[]
        );

        openOverlayPanel("koordinater");
      }
    }
  };

  return { selectPoint };
};

export default useSelectPoint;
