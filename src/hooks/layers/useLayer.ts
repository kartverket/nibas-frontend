import { useEffect } from "react";
import { Source } from "ol/source";
import { Layer } from "ol/layer";
import { useMap } from "components/Map/MapContext";
import { useVisibleLayers } from "./VisibleLayersContext";
import { LayerId } from "./types";

export const useLayer = <T extends Source>(
  layerId: LayerId,
  layer?: Layer<T>
) => {
  const { map } = useMap();
  const { isLayerVisible, setLayerVisibility } = useVisibleLayers();

  const layerVisible = isLayerVisible(layerId);

  useEffect(() => {
    if (!map || !layer) return;

    map.addLayer(layer);
    layer.set("id", layerId);
    setLayerVisibility(layerId, true);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer, layerId, setLayerVisibility]);

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
