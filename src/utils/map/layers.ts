import { LayerId } from "hooks/layers/types";
import Map from "ol/Map";

export const getLayersArray = (map: Map) => map.getLayers().getArray();

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
