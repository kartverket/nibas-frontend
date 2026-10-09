import { MapBrowserEvent } from "ol";
import { ListenerFunction } from "ol/events";
import { useEffect } from "react";
import { map } from "../constants";

const useHoveredFeature = (
  enabled: boolean,
  onPointerMove: (e: MapBrowserEvent<PointerEvent>) => void,
  clearHoverState: () => void,
) => {
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
        onPointerMove(e);
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
};

export default useHoveredFeature;
