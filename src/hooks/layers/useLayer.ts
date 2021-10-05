import { useEffect } from "react";
import { Source } from "ol/source";
import { Layer } from "ol/layer";
import { useMap } from "components/Map/MapContext";
export const useLayer = <T extends Source>(layer: Layer<T>) => {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer]);

  return layer;
};
