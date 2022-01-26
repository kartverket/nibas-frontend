import { getWidth } from "ol/extent";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { createXYZ } from "ol/tilegrid";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { BakgrunnskartId } from "hooks/layers/types";
import { getSrcWithTicket } from "utils/geonorgeTicket";

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

const getWMTSTileGrid = () => {
  // extent fått fra `optionsFromCapabilities` funksjon, se eksempler
  // https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
  // https://openlayers.org/en/latest/examples/wmts.html
  const extent = [-2500000, 3500000, 3045984, 9045984];
  const size = getWidth(extent) / 256;
  const resolutions = new Array(19);
  const matrixIds = new Array(19);
  for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = "EPSG:25833:" + z;
  }

  return new WMTSTileGrid({
    extent,
    resolutions,
    matrixIds,
  });
};

const defaultParams = {
  CRS: "EPSG:25833",
  TILED: true,
};

const createTileWMS = (
  url: string,
  mainLayerName: string,
  params: Record<string, unknown> = {}
) =>
  new TileWMS({
    url,
    params: {
      LAYERS: mainLayerName,
      ...defaultParams,
      ...params,
    },
  });

const createAuthedTileWMS = (
  url: string,
  mainLayerName: string,
  tjenesteId: string,
  params: Record<string, unknown> = {}
) =>
  new TileWMS({
    url,
    tileLoadFunction: async (imageTile, src) => {
      // dokumentasjonen mener dette skal være måten det gjøres på,
      // mens typescript klager. Type mismatch et sted i OpenLayers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (imageTile as any).getImage().src = await getSrcWithTicket(
        tjenesteId,
        src
      );
    },
    params: {
      LAYERS: mainLayerName,
      ...defaultParams,
      ...params,
    },
  });

export const bakgrunnskartSources = {
  administrativeGrenser: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
    "adm_enheter_V2_WMS"
  ),
  stedsnavn: createTileWMS(
    "http://openwms.statkart.no/skwms1/wms.stedsnavnenkel?version=1.3.0&service=wms",
    "stedsnavnenkel"
  ),
  topografiskNorgeskart: new WMTS({
    url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
    layer: "topo4",
    matrixSet: "EPSG:25833",
    tileGrid: getWMTSTileGrid(),
    style: "default",
    format: "image/png",
    wrapX: true,
  }),
  norgesMaritimeGrenser: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.nmg?service=wms",
    "nmg_WMS"
  ),
  administrativeGrenserHistorisk: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.adm_enheter_historisk?service=WMS",
    "adm_enheter_historisk_WMS"
  ),
  grunnkretser: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.grunnkretser?service=WMS",
    "grunnkretser_WMS"
  ),
  n5Raster2: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.n5raster2?service=WMS",
    "n5Raster_WMS"
  ),
  kartbladinndelinger: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.kartblad?service=WMS",
    "Kartblad_WMS"
  ),
  sjokartDybdedata: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.dybdedata2?service=WMS",
    "Dybdedata2"
  ),
  toporaster4: createTileWMS(
    "http://openwms.statkart.no/skwms1/wms.toporaster4?version=1.3.0&service=wms",
    "toporaster"
  ),
  stedsnavnSSR: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.ssr2?service=WMS",
    "ssr2_wms"
  ),
  historiskeKart: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.historiskekart?service=WMS",
    "historiskekart"
  ),
  topografiskNorgeskartGraatone: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.topo4.graatone?service=wms",
    "topo4graatone_WMS"
  ),
  sjokartElektroniske: createAuthedTileWMS(
    "/skwms1/wms.ecc_enc?service=WMS",
    "background",
    "wms.ecc_enc"
  ),
  norgeIBilder: createAuthedTileWMS("/skwms1/wms.nib", "ortofoto", "wms.nib"),
};

bakgrunnskartSources.norgeIBilder.set("protectedTjenesteId", "wms.nib");
bakgrunnskartSources.sjokartElektroniske.set(
  "protectedTjenesteId",
  "wms.ecc_enc"
);

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
