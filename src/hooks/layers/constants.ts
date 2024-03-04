import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getPointOverlayStyle, getLayerStyle } from "utils/map/layerStyles";
import { StyleFunction, StyleLike } from "ol/style/Style";
import { GrenseId, KartlagId } from "./types";
import WMTS from "ol/source/WMTS";
import TileWMS from "ol/source/TileWMS";
import { kartlagSources } from "./kartlagSources";
import { map } from "pages/Kart/constants";

const createTileLayerFromKartlagSource = (id: keyof typeof kartlagSources) => {
  const newLayer = new TileLayer({ source: kartlagSources[id], visible: false });
  newLayer.set("id", id);
  map.addLayer(newLayer);
  return newLayer;
};

export const kartlagLayers: Record<KartlagId, TileLayer<TileWMS | WMTS>> = {
  matrikkelenWMS: createTileLayerFromKartlagSource("matrikkelenWMS"),
  administrativeGrenser: createTileLayerFromKartlagSource("administrativeGrenser"),
  administrativeGrenserHistorisk: createTileLayerFromKartlagSource("administrativeGrenserHistorisk"),
  grunnkretserWMS: createTileLayerFromKartlagSource("grunnkretserWMS"),
  stedsnavn: createTileLayerFromKartlagSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromKartlagSource("stedsnavnSSR"),
  cachetjenester: createTileLayerFromKartlagSource("cachetjenester"),
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

const grenseStyle =
  (grenseId: GrenseId): StyleFunction =>
  (feature) => [...getLayerStyle(feature, grenseId, false), getPointOverlayStyle(feature)];

const createVectorLayer = (id: keyof typeof grenserLayers, style?: StyleLike, source?: VectorSource) => {
  const newLayer = new VectorLayer({
    source: source ?? new VectorSource(),
    style,
    declutter: true,
  });
  newLayer.set("id", id);
  map.addLayer(newLayer);
  return newLayer;
};

export const grenserLayers: Record<GrenseId, VectorLayer<VectorSource>> = {
  matrikkel: createVectorLayer("matrikkel"),
  fylke: createVectorLayer("fylke", grenseStyle("fylke")),
  kommune: createVectorLayer("kommune", grenseStyle("kommune")),
  nasjon: createVectorLayer("nasjon", grenseStyle("nasjon")),
  grunnkrets: createVectorLayer("grunnkrets", grenseStyle("grunnkrets")),
  stemmekrets: createVectorLayer("stemmekrets", grenseStyle("stemmekrets")),
  archived: createVectorLayer("archived", grenseStyle("archived"), archivedSource),
  edit: createVectorLayer("edit", grenseStyle("edit"), editSource),
};

export const editableBorderTypes = ["Delområdegrense", "Grunnkretsgrense", "Stemmekretsgrense", "Kommunegrense"];
