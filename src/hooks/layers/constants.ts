import { Options } from "ol/layer/BaseTile";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import { StyleFunction } from "ol/style/Style";
import { map } from "pages/Kart/constants";
import { getFlateHighlightStyle, getLayerStyle, getPointOverlayStyle } from "utils/map/layerStyles";
import { kartlagSources } from "./kartlagSources";
import { VectorLayerId, KartlagLayerId, HighlightVectorLayerId } from "./types";
import { Feature } from "ol";

const createTileLayerFromKartlagSource = (id: keyof typeof kartlagSources, options?: Options<WMTS | TileWMS>) => {
  const newLayer = new TileLayer({ source: kartlagSources[id], visible: false, preload: Infinity, ...options });
  newLayer.set("id", id);
  map.addLayer(newLayer);
  return newLayer;
};

export const kartlagLayers: Record<KartlagLayerId, TileLayer<TileWMS | WMTS>> = {
  matrikkelenWMS: createTileLayerFromKartlagSource("matrikkelenWMS"),
  administrativeGrenser: createTileLayerFromKartlagSource("administrativeGrenser"),
  administrativeGrenserHistorisk: createTileLayerFromKartlagSource("administrativeGrenserHistorisk"),
  grunnkretserWMS: createTileLayerFromKartlagSource("grunnkretserWMS"),
  stedsnavn: createTileLayerFromKartlagSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromKartlagSource("stedsnavnSSR"),
  topograatone: createTileLayerFromKartlagSource("topograatone", { opacity: 0.75 }),
  kartbladinndelinger: createTileLayerFromKartlagSource("kartbladinndelinger"),
  sjokartDybdedata: createTileLayerFromKartlagSource("sjokartDybdedata"),
  n5Raster2: createTileLayerFromKartlagSource("n5Raster2"),
  historiskeKart: createTileLayerFromKartlagSource("historiskeKart"),
  norgeIBilder: createTileLayerFromKartlagSource("norgeIBilder"),
  norgesMaritimeGrenser: createTileLayerFromKartlagSource("norgesMaritimeGrenser"),
  sjokartElektroniske: createTileLayerFromKartlagSource("sjokartElektroniske"),
};

export const editSource = new VectorSource();
export const archivedSource = new VectorSource();
export const measureSource = new VectorSource();

const grenseStyle =
  (grenseId: VectorLayerId): StyleFunction =>
  (feature) => [...getLayerStyle(feature, grenseId, false), getPointOverlayStyle(feature, grenseId)];

const createVectorLayer = (id: VectorLayerId, source?: VectorSource) => {
  const newLayer = new VectorLayer({
    source: source ?? new VectorSource(),
    style: grenseStyle(id),
    declutter: true,
  });
  newLayer.set("id", id);
  map.addLayer(newLayer);
  return newLayer;
};

export const grenserLayers: Record<VectorLayerId, VectorLayer<VectorSource<Feature>>> = {
  matrikkel: createVectorLayer("matrikkel"),
  sosiFiler: createVectorLayer("sosiFiler"),
  FYLKE: createVectorLayer("FYLKE"),
  KOMMUNE: createVectorLayer("KOMMUNE"),
  GRUNNKRETS: createVectorLayer("GRUNNKRETS"),
  STEMMEKRETS: createVectorLayer("STEMMEKRETS"),
  archived: createVectorLayer("archived", archivedSource),
  edit: createVectorLayer("edit", editSource),
  measure: createVectorLayer("measure", measureSource),
  historical: createVectorLayer("historical"),
  BOPLIKTOMRAADE: createVectorLayer("BOPLIKTOMRAADE"),
};

export const highlightStrokeSource = new VectorSource();
export const highlightPointSource = new VectorSource();

const createHighlightVectorLayer = (
  id: HighlightVectorLayerId,
  source: VectorSource,
  zIndex: number,
  style?: StyleFunction,
) => {
  const newLayer = new VectorLayer({
    source,
    zIndex,
    declutter: false,
    style,
  });
  newLayer.set("id", id);
  map.addLayer(newLayer);
  return newLayer;
};

export const highlightLayers: Record<HighlightVectorLayerId, VectorLayer<VectorSource<Feature>>> = {
  strokeHighlight: createHighlightVectorLayer("strokeHighlight", highlightStrokeSource, -1),
  pointsHighlight: createHighlightVectorLayer("pointsHighlight", highlightPointSource, 1000),
  flateHighlight: createHighlightVectorLayer("flateHighlight", new VectorSource(), -1, getFlateHighlightStyle),
};
