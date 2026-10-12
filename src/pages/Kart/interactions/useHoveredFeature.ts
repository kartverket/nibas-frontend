import { Feature, MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import { ListenerFunction } from "ol/events";
import { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import { useEffect, useState } from "react";
import { map } from "../constants";
import { useGetFeatures } from "./interaction-utils";

const useHoveredFeature = <T extends Geometry>(
  enabled: boolean,
  shouldClearHover: boolean | undefined,
  isTargetFeature: (feature: FeatureLike) => feature is Feature<T>,
) => {
  const { getFeaturesAtPixel } = useGetFeatures();
  const [hoveredFeature, setHoveredFeature] = useState<Feature<T> | null>(null);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<Coordinate>();

  const clearHoverState = () => {
    if (shouldClearHover === true) {
      setHoveredFeature(null);
      setHoveredCoordinate(undefined);
    }
  };

  useEffect(() => {
    // Definerer timeout her slik at vi kan referere til den før den blir satt i koden
    let timeout: ReturnType<typeof setTimeout>;

    const hover = (e: MapBrowserEvent<PointerEvent>) => {
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
          if (isTargetFeature(feature) && feature.getGeometry() != null) {
            setHoveredFeature(feature);
            setHoveredCoordinate(e.coordinate);
          }
        } else {
          clearHoverState();
        }
      }, 150);
    };
    if (enabled) {
      map.on("pointermove", hover as ListenerFunction);
    } else {
      clearHoverState();
    }
    return () => {
      clearTimeout(timeout);
      map.un("pointermove", hover as ListenerFunction);
    };
  }, [enabled]);

  return { hoveredFeature, hoveredCoordinate };
};

export default useHoveredFeature;
