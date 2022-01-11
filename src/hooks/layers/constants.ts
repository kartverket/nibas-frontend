import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import { BakgrunnskartId, GrenseId } from "hooks/sources/types";

// gi oss en error hvis layers ikke inneholder Layer definisjon for alle LayerIds
// behold typen til objektet for TS automagi uten å generalisere den
type IdGuard<
  Id extends string,
  Layers extends Record<Id, unknown>
> = Layers[Id] extends unknown ? Layers : never;

const typelessBakgrunnskartLayers = {
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
  administrativeGrenserHistorisk: new TileLayer({
    source: bakgrunnskartSources.administrativeGrenserHistorisk,
  }),
};

export const bakgrunnskartLayers = typelessBakgrunnskartLayers as IdGuard<
  BakgrunnskartId,
  typeof typelessBakgrunnskartLayers
>;

const typelessGrenserLayers = {
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

export const grenserLayers = typelessGrenserLayers as IdGuard<
  GrenseId,
  typeof typelessGrenserLayers
>;
