import { LayerId } from "hooks/layers/types";
import Layer from "ol/layer/Layer";
import Source from "ol/source/Source";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { MainMappedLayer } from "utils/getLayersFromWMS";

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

export const toggleLayerVisibility = (map: Map, layerId: LayerId) => {
  if (!map) return;

  const layer = getLayerById(map, layerId);

  if (!layer) return;

  layer.setVisible(!layer.getVisible());
};

export const getWMSLayersInMap = (map: Map) => {
  const layers = getLayersArray(map);

  return layers.filter(
    (layer) =>
      layer instanceof TileLayer && layer.getSource() instanceof TileWMS
  ) as TileLayer<TileWMS>[];
};

export const getLayerIdFromMappedLayer = (
  map: Map,
  mappedLayer: MainMappedLayer
) => {
  const layers = getLayersArray(map);
  const layer = layers.find(
    (layer) => layer.get("id") === mappedLayer.sourceId
  );

  if (!layer) return;

  return layer.get("id") as LayerId;
};
