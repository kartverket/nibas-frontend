import { Options } from "ol/layer/BaseTile";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import Style, { StyleFunction } from "ol/style/Style";
import { map } from "pages/Kart/constants";
import { getFlateHighlightStyle, getLayerStyle, getPointOverlayStyle } from "utils/map/layerStyles";
import { kartlagSources, matrikkelnummerSource } from "./kartlagSources";
import { VectorLayerId, KartlagLayerId, HighlightVectorLayerId } from "./types";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";

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

export const matrikkelnummerLayer = new TileLayer({ source: matrikkelnummerSource, visible: false });
matrikkelnummerLayer.set("id", "matrikkelnummer");
map.addLayer(matrikkelnummerLayer);

export const editSource = new VectorSource();
export const archivedSource = new VectorSource();
export const measureSource = new VectorSource();
export const navigationPinSource = new VectorSource<Feature<Point>>();

let navigationPinStyle: Style | undefined;

const getNavigationPinStyle = () => {
  if (navigationPinStyle == null) {
    const fillColor = getComputedStyle(document.documentElement).getPropertyValue("--kvib-colors-red-400").trim();
    const strokeColor = getComputedStyle(document.documentElement).getPropertyValue("--kvib-colors-red-600").trim();
    navigationPinStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" d="M16 1C8.3 1 2 7.3 2 15c0 10.5 14 24 14 24s14-13.5 14-24C30 7.3 23.7 1 16 1Z"/><circle cx="16" cy="15" r="5" fill="${strokeColor}"/></svg>`,
        )}`,
      }),
    });
  }
  return navigationPinStyle;
};

export const navigationPinLayer = new VectorLayer({
  source: navigationPinSource,
  zIndex: 1001,
  style: getNavigationPinStyle,
});
navigationPinLayer.set("id", "navigationPin");
map.addLayer(navigationPinLayer);

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

export const standaloneMapSources = [
  matrikkelnummerSource,
  navigationPinSource,
  ...Object.values(highlightLayers).flatMap((layer) => {
    const source = layer.getSource();
    return source ? [source] : [];
  }),
];
