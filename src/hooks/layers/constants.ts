import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import { getPointOverlayStyle, getLayerStyle } from "utils/map/layerStyles";
import { StyleFunction } from "ol/style/Style";
import { GrenseId } from "./types";

const createTileLayerFromBakgrunnskartSource = (
  id: keyof typeof bakgrunnskartSources
) => new TileLayer({ source: bakgrunnskartSources[id] });

export const bakgrunnskartLayers = {
  administrativeGrenser: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenser"
  ),
  administrativeGrenserHistorisk: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenserHistorisk"
  ),
  grunnkretserWMS: createTileLayerFromBakgrunnskartSource("grunnkretserWMS"),
  stedsnavn: createTileLayerFromBakgrunnskartSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromBakgrunnskartSource("stedsnavnSSR"),
  kartbladinndelinger: createTileLayerFromBakgrunnskartSource(
    "kartbladinndelinger"
  ),
  sjokartDybdedata: createTileLayerFromBakgrunnskartSource("sjokartDybdedata"),
  n5Raster2: createTileLayerFromBakgrunnskartSource("n5Raster2"),
  historiskeKart: createTileLayerFromBakgrunnskartSource("historiskeKart"),
  norgeIBilder: createTileLayerFromBakgrunnskartSource("norgeIBilder"),
  cachetjenester: createTileLayerFromBakgrunnskartSource("cachetjenester"),
  norgesMaritimeGrenser: createTileLayerFromBakgrunnskartSource(
    "norgesMaritimeGrenser"
  ),
  sjokartElektroniske: createTileLayerFromBakgrunnskartSource(
    "sjokartElektroniske"
  ),
  matrikkelenWfs: new VectorLayer({ source: new VectorSource() }),
};

export const editSource = new VectorSource();

const grenseStyle =
  (grenseId: GrenseId): StyleFunction =>
  (feature) =>
    [...getLayerStyle(feature, grenseId), getPointOverlayStyle(feature)];

export const grenserLayers = {
  // ingen source betyr at source settes async
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
  edit: new VectorLayer({
    source: editSource,
    style: grenseStyle("edit"),
    declutter: true,
  }),
};

export const editableBorderTypes = [
  "Delområdegrense",
  "Grunnkretsgrense",
  "Stemmekretsgrense",
];
