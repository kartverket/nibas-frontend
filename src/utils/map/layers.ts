import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import TileWMS from "ol/source/TileWMS";
import { map } from "components/Map/constants";
import {
  createLayers,
  INITIAL_VISIBILITY,
  INITIAL_ZINDEXES,
} from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";

export const getLayersArray = () => map?.getLayers().getArray() ?? [];
export const getLayerIds = () =>
  getLayersArray().map((layer) => layer.get("id"));

export const getLayerById = <T extends LayerId>(id: T) => {
  const layersWithId = getLayersArray().filter(
    (layer) => layer.get("id") === id
  );

  if (layersWithId.length !== 1) {
    throw new Error(
      `Fant ${layersWithId.length} lag med id ${id}. Sjekk funksjonen som oppretter og setter inn lag i kartet`
    );
  }

  return layersWithId[0] as ReturnType<typeof createLayers>[T];
};

export const layerExistsInMap = (id: LayerId) => {
  try {
    const layer = getLayerById(id);

    return !!layer;
  } catch {
    return false;
  }
};

export const isLayerVisible = (id: LayerId) =>
  getLayerById(id)?.getVisible() ?? false;

export const addLayerIfNotExists = (layer: Layer<Source>) => {
  if (!layerExistsInMap(layer.get("id"))) {
    map.addLayer(layer);
  }
};

export const getWMSLayersInMap = () => {
  const layers = getLayersArray();

  return layers.filter(
    (layer) =>
      layer instanceof TileLayer && layer.getSource() instanceof TileWMS
  ) as TileLayer<TileWMS>[];
};

export const getLayerIdFromMappedLayer = (mappedLayer: MainMappedLayer) => {
  const layers = getLayersArray();
  const layer = layers.find(
    (layer) => layer.get("id") === mappedLayer.sourceId
  );

  if (!layer) return;

  return layer.get("id") as LayerId;
};

export const initLayer = (layer: Layer<Source>, layerId: LayerId) => {
  layer.set("id", layerId);
  layer.setVisible(INITIAL_VISIBILITY[layerId]);
  layer.setZIndex(INITIAL_ZINDEXES[layerId]);
  addLayerIfNotExists(layer);
};

export const setSourceForVectorLayer = (
  layerId: LayerId,
  source: GeometryVectorSource
) => {
  const layer = getLayerById(layerId);

  if (!layer) return;

  if (!(layer instanceof VectorLayer)) {
    throw new Error(
      "Layer er ikke et VectorLayer, så man kan ikke sette Source"
    );
  }

  layer.setSource(source);
};
