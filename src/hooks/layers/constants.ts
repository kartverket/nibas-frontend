import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getPointOverlayStyle, getLayerStyle } from "utils/map/layerStyles";
import { StyleFunction } from "ol/style/Style";
import { GrenseId, KartlagId } from "./types";
import WMTS from "ol/source/WMTS";
import TileWMS from "ol/source/TileWMS";
import { kartlagSources } from "./kartlagSources";

const createTileLayerFromKartlagSource = (id: keyof typeof kartlagSources) =>
  new TileLayer({ source: kartlagSources[id] });

export const kartlagLayers: Record<KartlagId, TileLayer<TileWMS | WMTS> | VectorLayer<VectorSource>> = {
  cachetjenester: createTileLayerFromKartlagSource("cachetjenester"),
  matrikkelenWMS: createTileLayerFromKartlagSource("matrikkelenWMS"),
  administrativeGrenser: createTileLayerFromKartlagSource("administrativeGrenser"),
  administrativeGrenserHistorisk: createTileLayerFromKartlagSource("administrativeGrenserHistorisk"),
  grunnkretserWMS: createTileLayerFromKartlagSource("grunnkretserWMS"),
  stedsnavn: createTileLayerFromKartlagSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromKartlagSource("stedsnavnSSR"),
  kartbladinndelinger: createTileLayerFromKartlagSource("kartbladinndelinger"),
  sjokartDybdedata: createTileLayerFromKartlagSource("sjokartDybdedata"),
  n5Raster2: createTileLayerFromKartlagSource("n5Raster2"),
  historiskeKart: createTileLayerFromKartlagSource("historiskeKart"),
  norgeIBilder: createTileLayerFromKartlagSource("norgeIBilder"),
  norgesMaritimeGrenser: createTileLayerFromKartlagSource("norgesMaritimeGrenser"),
  sjokartElektroniske: createTileLayerFromKartlagSource("sjokartElektroniske"),
};

export const editSource = new VectorSource({ useSpatialIndex: false });
export const archivedSource = new VectorSource({ useSpatialIndex: false });

const grenseStyle =
  (grenseId: GrenseId): StyleFunction =>
  (feature) => [...getLayerStyle(feature, grenseId, false), getPointOverlayStyle(feature)];

export const grenserLayers = {
  // ingen source betyr at source settes async
  matrikkel: new VectorLayer({
    source: new VectorSource(),
  }),
  fylke: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("fylke"),
    declutter: true,
  }),
  kommune: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("kommune"),
    declutter: true,
  }),
  nasjon: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("nasjon"),
    declutter: true,
  }),
  grunnkrets: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("grunnkrets"),
    declutter: true,
  }),
  stemmekrets: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("stemmekrets"),
    declutter: true,
  }),
  archived: new VectorLayer({
    source: archivedSource,
    style: grenseStyle("archived"),
    declutter: true,
  }),
  edit: new VectorLayer({
    source: editSource,
    style: grenseStyle("edit"),
    declutter: true,
  }),
};

export const editableBorderTypes = ["Delområdegrense", "Grunnkretsgrense", "Stemmekretsgrense", "Kommunegrense"];
