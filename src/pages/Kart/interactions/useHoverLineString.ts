import { useEffect } from "react";
import { map } from "../constants";
import { Feature, MapBrowserEvent } from "ol";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import { isLineStringFeature } from "utils/type-utils";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";

const useHoverLineString = (
  enabled: boolean,
  onHover: (feature: Feature<LineString>, closestVertex: Coordinate, event: MapBrowserEvent<MouseEvent>) => void,
) => {
  useEffect(() => {
    // Definerer timeout her slik at vi kan referere til den før den blir satt i koden
    let timeout: NodeJS.Timeout;

    const hover = (e: MapBrowserEvent<MouseEvent>) => {
      // Hvis brukeren dragger trenger vi ikke å kalle hover funksjonalitet
      if (e.dragging) {
        return;
      }
      // Hvis det finnes et tidligere kall som ikke har blitt gjennomført enda kansellerer vi den
      clearTimeout(timeout);
      // Starter en ny timeout som det kan hende blir kansellert i fremtiden hvis musen beveger seg i mellomtiden.
      timeout = setTimeout(
        () =>
          map.forEachFeatureAtPixel(e.pixel, (feature) => {
            if (isLineStringFeature(feature)) {
              const lineString = feature.getGeometry();
              if (lineString != null) {
                const vertex = findNearbyVertexOnFeature(lineString, e.coordinate);
                if (vertex != null) {
                  onHover(feature, vertex, e);
                  // Vi ønsker kun å kalle på første feature vi hovrer hvis det er flere på pixelen
                  return true;
                }
              }
            }
          }),
        50,
      );
    };
    if (enabled) {
      map.on("pointermove", hover);
    }

    return () => {
      clearTimeout(timeout);
      map.un("pointermove", hover);
    };
  }, [enabled, onHover]);
};

export default useHoverLineString;
