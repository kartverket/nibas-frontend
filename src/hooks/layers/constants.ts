import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { ByLayerId, LayerId } from "./types";
import { bakgrunnskartSources } from "hooks/sources/syncSources";

// gi oss en error hvis layers ikke inneholder Layer definisjon for alle LayerIds
type LayerIdGuard<T extends ByLayerId<unknown>> = T[LayerId] extends unknown
  ? T
  : never;

export const bakgrunnskartLayers = {
  stedsnavn: new TileLayer({ source: bakgrunnskartSources.stedsnavn }),
  administrativeGrenser: new TileLayer({
    source: bakgrunnskartSources.administrativeGrenser,
  }),
  topografiskNorgeskart: new TileLayer({
    source: bakgrunnskartSources.topografiskNorgeskart,
  }),
  norgesMaritimeGrenser: new TileLayer({
    source: bakgrunnskartSources.norgesMaritimeGrenser,
  }),
};

export const grenserLayers = {
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

export const createLayers = () => {
  const layers = {
    ...bakgrunnskartLayers,
    ...grenserLayers,
  };

  return layers as LayerIdGuard<typeof layers>;
};

const getInitialZIndexes = () => {
  const bakgrunnskartIds = Object.keys(bakgrunnskartLayers);
  const bakgrunnskartZIndexes = bakgrunnskartIds.reduce(
    (acc, id, i) => ({
      ...acc,
      [id]: bakgrunnskartIds.length - i,
    }),
    {} as ByLayerId<number>
  );

  return bakgrunnskartZIndexes;
};

export const INITIAL_ZINDEXES = getInitialZIndexes();

export const INITIAL_VISIBILITY: ByLayerId<boolean> = {
  administrativeGrenser: false,
  fylker: true,
  kommuner: true,
  stedsnavn: true,
  topografiskNorgeskart: true,
  edit: true,
  norgesMaritimeGrenser: false,
};
