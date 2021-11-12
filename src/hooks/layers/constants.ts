import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { syncSources } from "hooks/sources/syncSources";
import { ByLayerId, LayerId } from "./types";

// gi oss en error hvis layers ikke inneholder Layer definisjon for alle LayerIds
type LayerIdGuard<T extends ByLayerId<unknown>> = T[LayerId] extends unknown
  ? T
  : never;

export const createLayers = () => {
  const layers = {
    topografiskNorgeskart: new TileLayer({
      source: syncSources.topografiskNorgeskart,
    }),
    administrativeGrenser: new TileLayer({
      source: syncSources.administrativeGrenser,
    }),
    background: new TileLayer({ source: syncSources.background }),
    vector: new VectorLayer({ source: syncSources.vector }),
    matrikkelen: new TileLayer({ source: syncSources.matrikkelen }),
    stedsnavn: new TileLayer({ source: syncSources.stedsnavn }),
    // ingen source betyr at source settes async
    fylker: new VectorLayer(),
    kommuner: new VectorLayer({ minZoom: 7 }),
  };

  return layers as LayerIdGuard<typeof layers>;
};

export const INITIAL_ZINDEXES: ByLayerId<number> = {
  topografiskNorgeskart: 0,
  administrativeGrenser: 1,
  fylker: 2,
  kommuner: 3,
  stedsnavn: 4,
  background: -1,
  matrikkelen: -2,
  vector: -3,
};

export const INITIAL_VISIBILITY: ByLayerId<boolean> = {
  administrativeGrenser: false,
  background: true,
  fylker: false,
  kommuner: true,
  vector: true,
  stedsnavn: true,
  topografiskNorgeskart: true,
  matrikkelen: true,
};
