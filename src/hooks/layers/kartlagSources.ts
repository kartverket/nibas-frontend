import { getWidth } from "ol/extent";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { createXYZ } from "ol/tilegrid";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { getSrcWithTicket } from "utils/geonorgeTicket";
import { KartlagId } from "./types";

const tileGrid = createXYZ({
  extent: [-2465144.8, 4102893.55, 776625.76, 9408555.22],
  tileSize: 1024,
});

const getWMTSTileGrid = (extent: number[], setMatrixId: (i: number) => string) => {
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

const getBaseGrid = () => getWMTSTileGrid([-2500000, 3500000, 3045984, 9045984], (z) => z.toString());

type WMTSConfig = {
  url: string;
  layer: string;
  matrixSet: string;
  tileGrid: WMTSTileGrid;
  style: string;
  format: string;
};

const topoWMTSConfig: WMTSConfig = {
  url: "https://cache.kartverket.no/topo/v1/wmts/1.0.0/",
  layer: "topo",
  matrixSet: "utm33n",
  tileGrid: getBaseGrid(),
  style: "default",
  format: "image/png",
};

const toporasterWMTSConfig: WMTSConfig = {
  url: "https://cache.kartverket.no/toporaster/v1/wmts/1.0.0/",
  layer: "toporaster",
  matrixSet: "utm33n",
  tileGrid: getBaseGrid(),
  style: "default",
  format: "image/png",
};

const topograatoneWMTSConfig: WMTSConfig = {
  url: "https://cache.kartverket.no/topograatone/v1/wmts/1.0.0/",
  layer: "topograatone",
  matrixSet: "utm33n",
  tileGrid: getBaseGrid(),
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

const createWMTS = (id: KartlagId, config: WMTSConfig) => {
  const wmts = new WMTS(config);

  // Setter id på alle sources for å kunne finne riktig mappedLayer senere
  wmts.set("id", id);

  // Setter config for å kunne bytte ut source når man toggler kartlag senere
  wmts.set("config", config);
  return wmts;
};

const defaultTileWMSParams = {
  CRS: "EPSG:25833",
  TILED: true,
};

const createTileWMS = (id: KartlagId, url: string) => {
  const tileWMS = new TileWMS({
    url,
    params: defaultTileWMSParams,
  });

  // Setter id på alle sources for å kunne finne riktig mappedLayer senere
  tileWMS.set("id", id);
  tileWMS.setTileGridForProjection("EPSG:25833", tileGrid);
  return tileWMS;
};

const createAuthedTileWMS = (id: KartlagId, url: string, tjenesteId: string) => {
  const tileWMS = new TileWMS({
    url,
    tileLoadFunction: async (imageTile, src) => {
      // dokumentasjonen mener dette skal være måten det gjøres på,
      // mens typescript klager. Type mismatch et sted i OpenLayers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (imageTile as any).getImage().src = await getSrcWithTicket(tjenesteId, src);
    },
    params: defaultTileWMSParams,
  });

  // Setter id på alle sources for å kunne finne riktig mappedLayer senere
  tileWMS.set("id", id);
  tileWMS.setTileGridForProjection("EPSG:25833", tileGrid);
  return tileWMS;
};

export const kartlagSources: Record<KartlagId, WMTS | TileWMS> = {
  topo: createWMTS("topo", topoWMTSConfig),
  toporaster: createWMTS("toporaster", toporasterWMTSConfig),
  topograatone: createWMTS("topograatone", topograatoneWMTSConfig),
  norgeIBilder: createWMTS("norgeIBilder", norgeIBilderConfig),
  administrativeGrenser: createTileWMS("administrativeGrenser", "https://wms.geonorge.no/skwms1/wms.adm_enheter2"),
  stedsnavn: createTileWMS("stedsnavn", "https://openwms.statkart.no/skwms1/wms.stedsnavnenkel"),
  norgesMaritimeGrenser: createTileWMS("norgesMaritimeGrenser", "https://openwms.statkart.no/skwms1/wms.nmg"),
  administrativeGrenserHistorisk: createTileWMS(
    "administrativeGrenserHistorisk",
    "https://wms.geonorge.no/skwms1/wms.adm_enheter_historisk",
  ),
  grunnkretserWMS: createTileWMS("grunnkretserWMS", "https://openwms.statkart.no/skwms1/wms.grunnkretser"),
  n5Raster2: createTileWMS("n5Raster2", "https://openwms.statkart.no/skwms1/wms.n5raster2"),
  kartbladinndelinger: createTileWMS("kartbladinndelinger", "https://openwms.statkart.no/skwms1/wms.kartblad"),
  sjokartDybdedata: createTileWMS("sjokartDybdedata", "https://wms.geonorge.no/skwms1/wms.dybdedata2"),
  stedsnavnSSR: createTileWMS("stedsnavnSSR", "https://openwms.statkart.no/skwms1/wms.ssr2"),
  historiskeKart: createTileWMS("historiskeKart", "https://wms.geonorge.no/skwms1/wms.historiskekart"),
  matrikkelenWMS: createAuthedTileWMS("matrikkelenWMS", "/skwms1/wms.matrikkel.v1", "background"),
  sjokartElektroniske: createAuthedTileWMS("sjokartElektroniske", "/skwms1/wms.ecc_enc", "background"),
};

kartlagSources.norgeIBilder.set("protectedTjenesteId", "wms.nib");
kartlagSources.sjokartElektroniske.set("protectedTjenesteId", "wms.ecc_enc");
