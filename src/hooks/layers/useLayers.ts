import { useEffect } from "react";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { AsyncSourceId, AsyncSources, SyncSourceId } from "hooks/sources/types";
import {
  addLayerIfNotExists,
  getLayerById,
  getLayersArray,
} from "utils/map/layers";
import { getSyncLayers, INITIAL_ZINDEXES } from "./constants";
import { map } from "components/Map/constants";
import { LayerId } from "./types";
import { VisibleLayers } from "./useVisibleLayers";

const useLayers = (
  asyncSources: AsyncSources,
  visibleLayers: VisibleLayers
) => {
  // legg alle konstante sources inn i layer
  useEffect(() => {
    const syncLayers = getSyncLayers();

    Object.keys(syncLayers).forEach((sourceId) => {
      const layer = syncLayers[sourceId as SyncSourceId];
      layer.setZIndex(INITIAL_ZINDEXES[sourceId as LayerId]);
      layer.set("id", sourceId);
      addLayerIfNotExists(map, layer);
    });
  }, []);

  // legg til async lag når sources blir oppdatert
  useEffect(() => {
    const asyncLayers: Record<AsyncSourceId, Layer<Source> | undefined> = {
      fylker:
        asyncSources.fylker && new VectorLayer({ source: asyncSources.fylker }),
      kommuner:
        asyncSources.kommuner &&
        new VectorLayer({ source: asyncSources.kommuner, minZoom: 11 }),
    };

    Object.keys(asyncLayers).forEach((asyncSourceId) => {
      const layer = asyncLayers[asyncSourceId as AsyncSourceId];

      if (!layer) return;

      layer.set("id", asyncSourceId);
      addLayerIfNotExists(map, layer);
    });
  }, [asyncSources]);

  // sett synlighet på lag i map
  useEffect(() => {
    Object.keys(visibleLayers).forEach((layerId) => {
      const layer = getLayerById(map, layerId as LayerId);
      layer?.setVisible(visibleLayers[layerId as LayerId]);
    });
  }, [asyncSources, visibleLayers]);

  // fjern layers når map unmountes
  useEffect(() => {
    return () => {
      const layers = getLayersArray(map);
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, []);
};

export default useLayers;
