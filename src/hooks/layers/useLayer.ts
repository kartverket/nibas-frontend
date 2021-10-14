import { useEffect } from "react";
import { Source } from "ol/source";
import { Layer } from "ol/layer";
import { useMap } from "components/Map/MapContext";
import { LayerId } from "./types";

export const useLayer = <T extends Source>(
  layerId: LayerId,
  layer: Layer<T> | undefined,
  visible: boolean
) => {
  const { map } = useMap();

  useEffect(() => {
    if (!layer) return;

    layer.set("id", layerId);
  }, [layer, layerId]);

  useEffect(() => {
    if (!map || !layer) return;

    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer]);

  useEffect(() => {
    if (!layer) return;

    if (visible) {
      layer.setVisible(true);
    } else {
      layer.setVisible(false);
    }
  }, [layer, visible]);

  return layer;
};
