import TileWMS from "ol/source/TileWMS";
import { createXYZ } from "ol/tilegrid";
import { SyncSourceId, SyncSources } from "./types";

const getWMSTileGrid = () => {
  const tileSize = 1056;
  // http://epsg.io/25833
  // extent for EPSG:25833
  const extent = [-2465144.8, 4102893.55, 776625.76, 9408555.22];
  const tileGrid = createXYZ({
    extent,
    tileSize,
  });

  return tileGrid;
};

const administrativeEnheterSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
  params: { LAYERS: "adm_enheter_V2_WMS", CRS: "EPSG:25833", TILED: true },
  tileGrid: getWMSTileGrid(),
});

const stedsnavnSource = new TileWMS({
  url: "http://openwms.statkart.no/skwms1/wms.stedsnavnenkel?version=1.3.0&service=wms",
  params: {
    LAYERS: "stedsnavnenkel",
    CRS: "EPSG:25833",
    format: "image/png",
    TILED: true,
  },
  tileGrid: getWMSTileGrid(),
});

const topografiskNorgeskartSource = new TileWMS({
  url: "https://openwms.statkart.no/skwms1/wms.topo4?service=wms",
  params: {
    LAYERS: "topo4_WMS",
    CRS: "EPSG:25833",
    format: "image/png",
    TILED: true,
  },
  tileGrid: getWMSTileGrid(),
});

export const syncSources: SyncSources = {
  administrativeGrenser: administrativeEnheterSource,
  stedsnavn: stedsnavnSource,
  topografiskNorgeskart: topografiskNorgeskartSource,
};

// sett id på alle sources for å gjøre de mulig å sjekke opp med layers
(() => {
  Object.keys(syncSources).forEach((id) =>
    syncSources[id as SyncSourceId].set("id", id)
  );
})();
