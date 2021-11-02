import { LayerId } from "hooks/layers/types";
import Layer from "ol/layer/Layer";
import Source from "ol/source/Source";
import { map } from "components/Map/constants";

export const getLayersArray = () => map.getLayers().getArray();
export const getLayerIds = () =>
  getLayersArray().map((layer) => layer.get("id"));

export const getLayerById = (id: LayerId) => {
  const layersWithId = getLayersArray().filter(
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

export const layerExistsInMap = (id: LayerId) => !!getLayerById(id);

export const isLayerVisible = (id: LayerId) =>
  getLayerById(id)?.getVisible() ?? false;

export const addLayerIfNotExists = (layer: Layer<Source>) => {
  if (!layerExistsInMap(layer.get("id"))) {
    map.addLayer(layer);
  }
};
