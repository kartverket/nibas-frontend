import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { ByLayerId, LayerId } from "./types";
import { syncSources } from "hooks/sources/syncSources";

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
    stedsnavn: new TileLayer({ source: syncSources.stedsnavn }),
    // ingen source betyr at source settes async
    fylker: new VectorLayer({ source: new VectorSource() }),
    kommuner: new VectorLayer({ source: new VectorSource() }),
    edit: new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: "red",
        }),
      }),
    }),
  };

  return layers as LayerIdGuard<typeof layers>;
};

// jo senere definert lag, jo høyere z index
export const INITIAL_ZINDEXES: ByLayerId<number> = Object.keys(
  createLayers()
).reduce(
  (acc, layerId, i) => ({
    ...acc,
    [layerId as LayerId]: i,
  }),
  {} as ByLayerId<number>
);

export const INITIAL_VISIBILITY: ByLayerId<boolean> = {
  administrativeGrenser: false,
  fylker: true,
  kommuner: true,
  stedsnavn: true,
  topografiskNorgeskart: true,
  edit: true,
};
