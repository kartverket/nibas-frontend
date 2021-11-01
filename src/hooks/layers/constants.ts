import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { getSyncSources } from "hooks/sources/syncSources";
import { SyncSourceId } from "hooks/sources/types";

export const getSyncLayers: () => Record<SyncSourceId, Layer<Source>> = () => {
  const syncSources = getSyncSources();

  return {
    administrativeGrenser: new TileLayer({
      source: syncSources.administrativeGrenser,
    }),
    background: new TileLayer({ source: syncSources.background }),
    vector: new VectorLayer({ source: syncSources.vector }),
    matrikkelen: new TileLayer({ source: syncSources.matrikkelen }),
    stedsnavn: new TileLayer({ source: syncSources.stedsnavn }),
  };
};
