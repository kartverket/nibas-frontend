import { useEffect } from "react";
import { Source } from "ol/source";
import { Layer } from "ol/layer";
import { useMap } from "components/Map/MapContext";
import { useVisibleLayers } from "./VisibleLayersContext";

export const useLayer = <T extends Source>(
  layerId: string,
  layer?: Layer<T>
) => {
  const { map } = useMap();
  const { isLayerVisible } = useVisibleLayers();

  const layerVisible = isLayerVisible(layerId);

  useEffect(() => {
    if (!map || !layer) return;

    layer.set("id", layerId);
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer, layerId]);

  useEffect(() => {
    if (!layer) return;

    if (layerVisible) {
      layer.setVisible(true);
    } else {
      layer.setVisible(false);
    }
  }, [map, layer, layerVisible]);

  return layer;
};
