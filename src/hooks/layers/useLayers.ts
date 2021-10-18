import { useEffect } from "react";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { AsyncSourceId, AsyncSources, SyncSourceId } from "hooks/sources/types";
import { useMap } from "components/Map/MapContext";
import { addLayerIfNotExists, getLayersArray } from "utils/map/layers";
import { getSyncLayers } from "./constants";

const useLayers = (sources: AsyncSources) => {
  const { map } = useMap();

  // legg alle konstante sources inn i layer
  useEffect(() => {
    if (!map) return;

    const syncLayers = getSyncLayers();

    Object.keys(syncLayers).forEach((sourceId) => {
      const layer = syncLayers[sourceId as SyncSourceId];
      layer.set("id", sourceId);
      addLayerIfNotExists(map, layer);
    });
  }, [map]);

  // legg til async lag når sources blir oppdatert
  useEffect(() => {
    if (!map) return;

    const asyncLayers: Record<AsyncSourceId, Layer<Source> | undefined> = {
      fylker: sources.fylker && new VectorLayer({ source: sources.fylker }),
      kommuner:
        sources.kommuner &&
        new VectorLayer({ source: sources.kommuner, minZoom: 11 }),
    };

    Object.keys(asyncLayers).forEach((asyncSourceId) => {
      const layer = asyncLayers[asyncSourceId as AsyncSourceId];

      if (!layer) return;

      layer.set("id", asyncSourceId);
      addLayerIfNotExists(map, layer);
    });
  }, [map, sources]);

  // fjern layers når map unmountes
  useEffect(() => {
    if (!map) return;

    return () => {
      const layers = getLayersArray(map);
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [map]);
};

export default useLayers;
