import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import {
  defaultStyle,
  editStyle,
  editPointStyle,
  defaultPointStyle,
} from "utils/map/layerStyles";

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

export const grenserLayers = {
  // ingen source betyr at source settes async
  fylker: new VectorLayer({
    source: new VectorSource(),
    style: [defaultStyle, defaultPointStyle],
  }),
  kommuner: new VectorLayer({
    source: new VectorSource(),
    style: [defaultStyle, defaultPointStyle],
  }),
  nasjoner: new VectorLayer({
    source: new VectorSource(),
    style: [defaultStyle, defaultPointStyle],
  }),
  grunnkretser: new VectorLayer({
    source: new VectorSource(),
    style: [defaultStyle, defaultPointStyle],
  }),
  stemmekretser: new VectorLayer({
    source: new VectorSource(),
    style: [defaultStyle, defaultPointStyle],
  }),
  edit: new VectorLayer({
    source: new VectorSource(),
    style: [editStyle, editPointStyle],
  }),
};
