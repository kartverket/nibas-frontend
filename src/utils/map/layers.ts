import { LayerId } from "hooks/layers/types";
import Layer from "ol/layer/Layer";
import Source from "ol/source/Source";
import Map from "ol/Map";

export const getLayersArray = (map: Map | undefined) =>
  map?.getLayers().getArray() ?? [];

export const getLayerIds = (map: Map | undefined) =>
  getLayersArray(map).map((layer) => layer.get("id"));

export const getLayerById = (map: Map, id: LayerId) => {
  const layersWithId = getLayersArray(map).filter(
    (layer) => layer.get("id") === id
  );

  if (layersWithId.length === 0) {
    return null;
  }

  if (layersWithId.length > 1) {
    throw new Error(
      `Found ${layersWithId.length} layers with id ${id}. Check the function that inserts layers`
    );
  }

  return layersWithId[0];
};

export const layerExistsInMap = (map: Map, id: LayerId) =>
  !!getLayerById(map, id);

export const isLayerVisible = (map: Map, id: LayerId) =>
  getLayerById(map, id)?.getVisible() ?? false;

export const addLayerIfNotExists = (map: Map, layer: Layer<Source>) => {
  if (!layerExistsInMap(map, layer.get("id"))) {
    map.addLayer(layer);
  }
};
