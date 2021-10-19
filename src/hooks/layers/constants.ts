import { getSyncSources } from "hooks/sources/constants";
import { SyncSourceId } from "hooks/sources/types";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import { ByLayerId } from "./types";

export const getSyncLayers: () => Record<SyncSourceId, Layer<Source>> = () => {
  const syncSources = getSyncSources();

  return {
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
  };
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
