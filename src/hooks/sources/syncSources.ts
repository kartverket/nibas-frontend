import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import { SyncSourceId, SyncSources } from "./types";

const tileSource = new XYZ({
  url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
});

const administrativeEnheterSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
  params: { LAYERS: "adm_enheter_V2_WMS", CRS: "EPSG:25833" },
});

const matrikkelenSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.matrikkel.v1?service=WMS",
  params: { LAYERS: "matrikkel:GATEADRESSEWFS", CRS: "EPSG:4326" },
  // tileLoadFunction: async (tile, src) => {
  //   const response = await fetch(src);
  //   console.log(response);
  // },
});

const stedsnavnSource = new TileWMS({
  url: "http://openwms.statkart.no/skwms1/wms.stedsnavnenkel?version=1.3.0&service=wms",
  params: { LAYERS: "stedsnavnenkel", CRS: "EPSG:25833", format: "image/png" },
});

const topografiskNorgeskartSource = new TileWMS({
  url: "https://openwms.statkart.no/skwms1/wms.topo4?service=wms",
  params: { LAYERS: "topo4_WMS", CRS: "EPSG:25833", format: "image/png" },
});

export const syncSources: SyncSources = {
  administrativeGrenser: administrativeEnheterSource,
  background: tileSource,
  matrikkelen: matrikkelenSource,
  stedsnavn: stedsnavnSource,
  topografiskNorgeskart: topografiskNorgeskartSource,
};

// sett id på alle sources for å gjøre de mulig å sjekke opp med layers
(() => {
  Object.keys(syncSources).forEach((id) =>
    syncSources[id as SyncSourceId].set("id", id)
  );
})();
