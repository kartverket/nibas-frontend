import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { bakgrunnskartSources } from "hooks/sources/syncSources";

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
  administrativeGrenserHistorisk: new TileLayer({
    source: bakgrunnskartSources.administrativeGrenserHistorisk,
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
