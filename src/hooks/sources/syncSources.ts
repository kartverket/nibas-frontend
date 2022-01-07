import TileWMS from "ol/source/TileWMS";
import { createXYZ } from "ol/tilegrid";
import { BakgrunnskartId, BakgrunnskartSources } from "./types";

const getWMSTileGrid = () => {
  // default er 256, så vi henter 4 ganger så store tiles
  const tileSize = 1024;
  // http://epsg.io/25833
  // extent for EPSG:25833
  const extent = [-2465144.8, 4102893.55, 776625.76, 9408555.22];
  const tileGrid = createXYZ({
    extent,
    tileSize,
  });

  return tileGrid;
};

const defaultParams = {
  CRS: "EPSG:25833",
  TILED: true,
};

const administrativeEnheterSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
  params: { LAYERS: "adm_enheter_V2_WMS", ...defaultParams },
});

const stedsnavnSource = new TileWMS({
  url: "http://openwms.statkart.no/skwms1/wms.stedsnavnenkel?version=1.3.0&service=wms",
  params: {
    LAYERS: "stedsnavnenkel",
    format: "image/png",
    ...defaultParams,
  },
});

const topografiskNorgeskartSource = new TileWMS({
  url: "https://openwms.statkart.no/skwms1/wms.topo4?service=wms",
  params: {
    LAYERS: "topo4_WMS",
    format: "image/png",
    ...defaultParams,
  },
});

const norgesMaritimeGrenserSource = new TileWMS({
  url: "https://openwms.statkart.no/skwms1/wms.nmg?service=wms",
  params: {
    LAYERS: "nmg_WMS",
    ...defaultParams,
  },
});

export const bakgrunnskartSources: BakgrunnskartSources = {
  administrativeGrenser: administrativeEnheterSource,
  stedsnavn: stedsnavnSource,
  topografiskNorgeskart: topografiskNorgeskartSource,
  norgesMaritimeGrenser: norgesMaritimeGrenserSource,
};

(() => {
  const tileGrid = getWMSTileGrid();

  Object.keys(bakgrunnskartSources).forEach((id) => {
    // sett id på alle sources for å gjøre de mulig å sjekke opp  med layers
    bakgrunnskartSources[id as BakgrunnskartId].set("id", id);

    // sett tile grid på alle sources
    bakgrunnskartSources[id as BakgrunnskartId].setTileGridForProjection(
      "EPSG:25833",
      tileGrid
    );
  });
})();
