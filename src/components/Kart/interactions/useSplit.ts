import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { map } from "components/Kart/constants";
import { useHistory } from "contexts/HistoryContext";
import { getLayerById } from "utils/map/layers";
import { MapBrowserEvent } from "ol";
import Geometry from "ol/geom/Geometry";
import { squaredDistance } from "ol/coordinate";
import { addFeaturesToSource } from "utils/map/source";
import { pixelTolerance } from "./constants";

// TODO: denne koden er ikke i bruk og skal ombygges i fremtiden
// vi måtte gå tilbake til scratch for å finne ut hva backenden vil ha fra frontenden
// mye av koden vil nok overleve, men detaljene rundt hva klonen har av data vil nok endres
const useSplit = () => {
  const { addEntry, activePointMode } = useHistory();

  const split = (event: MapBrowserEvent<MouseEvent>) => {
    if (activePointMode === "split" && !event.dragging) {
      // Stopper propagering for å unngå selection når man skal splitte
      event.stopPropagation();

      const editLayer = getLayerById("edit");
      const features = map.getFeaturesAtPixel(event.pixel, {
        layerFilter: (layer) => layer === editLayer,
        hitTolerance: pixelTolerance,
      });
      // Forutsetter at man bare trykker på én feature
      const feature = features[0];
      if (feature instanceof Feature<Geometry>) {
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();
        const featureId = feature.getId() as string;

        // Siden OL-objekter er mutable og vi trenger dette til senere:
        const originalCoordinates = [...coordinates];

        // Ikke vits å gjøre splitting med mindre du har en linje med minst tre punkter
        if (coordinates.length > 2) {
          const coordinatesWithDistance = coordinates.map((coord) => [
            ...coord,
            squaredDistance(coord, event.coordinate),
          ]);
          const nearestVertex = coordinatesWithDistance
            .sort((a, b) => a[2] - b[2])
            .map((cwd) => cwd.slice(0, -1))[0];

          const nearestVertexIndex = coordinates.findIndex(
            (v) => v[0] === nearestVertex[0] && v[1] === nearestVertex[1]
          );

          const clonedFeature = feature.clone();
          const clonedFeatureId = `${featureId}-clone`;
          const clonedGeometry = clonedFeature.getGeometry() as LineString;
          const clonedCoordinates = clonedGeometry.getCoordinates();
          clonedFeature.setId(clonedFeatureId);

          const headCoordinates = coordinates.splice(0, nearestVertexIndex + 1);
          const tailCoordinates = clonedCoordinates.splice(nearestVertexIndex);

          geometry.setCoordinates(headCoordinates);
          clonedGeometry.setCoordinates(tailCoordinates);

          addFeaturesToSource("edit", [clonedFeature]);

          if (featureId && clonedFeatureId) {
            addEntry({
              type: "grense",
              changes: [
                {
                  id: featureId,
                  from: originalCoordinates,
                  to: coordinates,
                },
                {
                  id: clonedFeatureId,
                  from: [],
                  to: clonedCoordinates,
                },
              ],
            });
          }
        }
      }
    }
  };
  return { split };
};

export default useSplit;
