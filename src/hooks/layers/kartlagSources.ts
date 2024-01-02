import { getWidth } from "ol/extent";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { createXYZ } from "ol/tilegrid";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { getSrcWithTicket } from "utils/geonorgeTicket";
import VectorSource from "ol/source/Vector";
import { KartlagId } from "./types";

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

const getWMTSTileGrid = (
  extent: number[],
  setMatrixId: (i: number) => string,
) => {
  const size = getWidth(extent) / 256;
  const resolutions = new Array(19);
  const matrixIds = new Array(19);
  for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = setMatrixId(z);
  }

  return new WMTSTileGrid({
    extent,
    resolutions,
    matrixIds,
  });
};

// extent fått fra `optionsFromCapabilities` funksjon, se eksempler
// https://openlayers.org/en/latest/examples/wmts-layer-from-capabilities.html
// https://openlayers.org/en/latest/examples/wmts.html
const get25833Grid = () =>
  getWMTSTileGrid(
    [-2500000, 3500000, 3045984, 9045984],
    (z) => "EPSG:25833:" + z,
  );

const getBaseGrid = () =>
  getWMTSTileGrid([-2500000, 3500000, 3045984, 9045984], (z) => z.toString());

type WMTSConfig = {
  url: string;
  layer: string;
  matrixSet: string;
  tileGrid: WMTSTileGrid;
  style: string;
  format: string;
};

const cachetjenesterConfig: WMTSConfig = {
  url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
  layer: "norges_grunnkart_graatone",
  matrixSet: "EPSG:25833",
  tileGrid: get25833Grid(),
  style: "default",
  format: "image/png",
};

const norgeIBilderConfig: WMTSConfig = {
  url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2",
  layer: "Nibcache_UTM33_EUREF89_v2",
  matrixSet: "default028mm",
  tileGrid: getBaseGrid(),
  style: "default",
  format: "image/png",
};

const topoWMTSConfig: WMTSConfig = {
  url: "https://cache.kartverket.no/topo4/v1/wmts/1.0.0/",
  layer: "Topografisk Norgeskart",
  matrixSet: "utm33n",
  tileGrid: getBaseGrid(),
  style: "default",
  format: "image/png",
};

const europaKartConfig: WMTSConfig = {
  url: "https://cache.kartverket.no/europa_forenklet/v1/wmts/1.0.0/",
  layer: "Europeisk bakgrunnskart forenklet",
  matrixSet: "utm33n",
  tileGrid: getBaseGrid(),
  style: "default",
  format: "image/png",
};

const defaultParams = {
  CRS: "EPSG:25833",
  TILED: true,
};

const createTileWMS = (url: string, params: Record<string, unknown> = {}) =>
  new TileWMS({
    url,
    params: {
      ...defaultParams,
      ...params,
    },
  });

const createAuthedTileWMS = (
  url: string,
  tjenesteId: string,
  params: Record<string, unknown> = {},
) =>
  new TileWMS({
    url,
    tileLoadFunction: async (imageTile, src) => {
      // dokumentasjonen mener dette skal være måten det gjøres på,
      // mens typescript klager. Type mismatch et sted i OpenLayers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (imageTile as any).getImage().src = await getSrcWithTicket(
        tjenesteId,
        src,
      );
    },
    params: {
      ...defaultParams,
      ...params,
    },
  });

export const kartlagSources: Record<KartlagId, TileWMS | WMTS> = {
  administrativeGrenser: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.adm_enheter2",
  ),
  stedsnavn: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.stedsnavnenkel",
  ),
  cachetjenester: new WMTS(cachetjenesterConfig),
  norgesMaritimeGrenser: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.nmg",
  ),
  administrativeGrenserHistorisk: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.adm_enheter_historisk",
  ),
  grunnkretserWMS: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.grunnkretser",
  ),
  n5Raster2: createTileWMS("https://openwms.statkart.no/skwms1/wms.n5raster2"),
  kartbladinndelinger: createTileWMS(
    "https://openwms.statkart.no/skwms1/wms.kartblad",
  ),
  sjokartDybdedata: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.dybdedata2",
  ),
  stedsnavnSSR: createTileWMS("https://openwms.statkart.no/skwms1/wms.ssr2"),
  historiskeKart: createTileWMS(
    "https://wms.geonorge.no/skwms1/wms.historiskekart",
  ),
  matrikkelenWMS: createAuthedTileWMS(
    "https://wms.geonorge.no/skwms1/wms.matrikkel.v1",
    "background",
  ),
  sjokartElektroniske: createAuthedTileWMS("/skwms1/wms.ecc_enc", "background"),
  europaKart: new WMTS(europaKartConfig),
  topoWMTS: new WMTS(topoWMTSConfig),
  norgeIBilder: new WMTS(norgeIBilderConfig),
};

kartlagSources.norgeIBilder.set("protectedTjenesteId", "wms.nib");
kartlagSources.sjokartElektroniske.set("protectedTjenesteId", "wms.ecc_enc");

kartlagSources.cachetjenester.set("config", cachetjenesterConfig);
kartlagSources.norgeIBilder.set("config", norgeIBilderConfig);
kartlagSources.europaKart.set("config", europaKartConfig);
kartlagSources.topoWMTS.set("config", topoWMTSConfig);

(() => {
  const tileGrid = getWMSTileGrid();

  Object.keys(kartlagSources).forEach((id) => {
    const source = kartlagSources[id as keyof typeof kartlagSources];

    // sett id på alle sources for å gjøre de mulig å sjekke opp  med layers
    source.set("id", id);

    if (source instanceof WMTS || source instanceof VectorSource) return;

    // sett tile grid på alle WMS-lag
    source.setTileGridForProjection("EPSG:25833", tileGrid);
  });
})();
