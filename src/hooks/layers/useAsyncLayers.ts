import { useEffect } from "react";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { AsyncSourceId, AsyncSources } from "hooks/sources/types";
import { addLayerIfNotExists } from "utils/map/layers";
import { map } from "components/Map/constants";
import { INITIAL_VISIBILITY } from "./constants";

const useAsyncLayers = (asyncSources: AsyncSources) => {
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
      layer.setVisible(INITIAL_VISIBILITY[asyncSourceId as AsyncSourceId]);
      addLayerIfNotExists(map, layer);
    });
  }, [asyncSources]);
};

export default useAsyncLayers;
