import { useEffect, useState } from "react";
import { map } from "../constants";
import { Feature, MapBrowserEvent } from "ol";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import { isLineStringFeature } from "utils/type-utils";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";
import { useGetFeatures } from "./interaction-utils";

const useHoveredLineString = (enabled: boolean) => {
  const { getFeaturesAtPixel } = useGetFeatures();

  const [hoveredVertex, setHoveredVertex] = useState<Coordinate | undefined>();
  const [hoveredLineString, setHoveredLineString] = useState<Feature<LineString> | null>(null);

  useEffect(() => {
    // Definerer timeout her slik at vi kan referere til den før den blir satt i koden
    let timeout: NodeJS.Timeout;

    const setHoverState = (linestring: Feature<LineString> | null, vertex?: Coordinate) => {
      setHoveredLineString(linestring);
      setHoveredVertex(vertex);
    };

    const hover = (e: MapBrowserEvent<MouseEvent>) => {
      // Hvis det finnes et tidligere kall som ikke har blitt gjennomført enda kansellerer vi den
      clearTimeout(timeout);
      // Hvis brukeren dragger trenger vi ikke å kalle hover funksjonalitet
      if (e.dragging) {
        return;
      }
      // Starter en ny timeout som det kan hende blir kansellert i fremtiden hvis musen beveger seg i mellomtiden.
      timeout = setTimeout(() => {
        const features = getFeaturesAtPixel(e, null);
        // Vi velger første feature. Hvis det er flere må man zoome inn for å treffe den man tenker på.
        const feature = features[0];
        if (feature != null) {
          if (isLineStringFeature(feature)) {
            const lineString = feature.getGeometry();
            if (lineString != null) {
              const vertex = findNearbyVertexOnFeature(lineString, e.coordinate);
              if (vertex != null) {
                setHoverState(feature, vertex);
              } else {
                setHoverState(feature);
              }
            }
          }
        } else {
          setHoverState(null);
        }
      }, 150);
    };
    if (enabled) {
      map.on("pointermove", hover);
    } else {
      setHoverState(null);
    }
    return () => {
      clearTimeout(timeout);
      map.un("pointermove", hover);
    };
  }, [enabled, getFeaturesAtPixel]);

  return { hoveredLineString, hoveredVertex };
};

export default useHoveredLineString;
