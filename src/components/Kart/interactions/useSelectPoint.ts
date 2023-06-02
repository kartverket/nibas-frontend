import { Feature, MapBrowserEvent } from "ol";
import { map } from "../constants";
import { getLayerById } from "utils/map/layers";
import { pixelTolerance } from "./constants";
import Geometry from "ol/geom/Geometry";
import { useToolbar } from "contexts/ToolbarContext";
import LineString from "ol/geom/LineString";
import { squaredDistance } from "ol/coordinate";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { editableBorderTypes } from "hooks/layers/constants";

const useSelectPoint = () => {
  const { activePointMode } = useToolbar();
  const { openOverlayPanel, closeOverlayPanel, setSelectedPoint } =
    useOverlayPanel();

  const selectPoint = (event: MapBrowserEvent<MouseEvent>) => {
    // TODO: verifiser nytteverdien til denne

    if (activePointMode === "koordinater" && !event.dragging) {
      // TODO: verifiser nytteverdien til denne
      event.stopPropagation();

      const editLayer = getLayerById("edit");
      const features = map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === editLayer,
        hitTolerance: pixelTolerance,
      });

      if (features.length === 0) {
        setSelectedPoint(null);
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

        // TODO: synliggjør at noe blir valgt
        setSelectedPoint({
          coordinates: [
            nearestVertexCoordinates[0],
            nearestVertexCoordinates[1],
          ],
          features: features as Feature<Geometry>[],
        });

        openOverlayPanel("koordinater");
      }
    }
  };

  return { selectPoint };
};

export default useSelectPoint;
