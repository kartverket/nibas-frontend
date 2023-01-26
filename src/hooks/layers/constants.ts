import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import { getPointOverlayStyle, grensetypeStyles } from "utils/map/layerStyles";
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
    [...grensetypeStyles[grenseId], getPointOverlayStyle(feature)];

export const grenserLayers = {
  // ingen source betyr at source settes async
  fylker: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("fylker"),
  }),
  kommuner: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("kommuner"),
  }),
  nasjoner: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("nasjoner"),
  }),
  grunnkretser: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("grunnkretser"),
  }),
  stemmekretser: new VectorLayer({
    source: new VectorSource(),
    style: grenseStyle("stemmekretser"),
  }),
  edit: new VectorLayer({
    source: editSource,
    style: grenseStyle("edit"),
  }),
};
