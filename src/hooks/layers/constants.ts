import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { bakgrunnskartSources } from "hooks/sources/syncSources";

const createTileLayerFromBakgrunnskartSource = (
  id: keyof typeof bakgrunnskartSources
) => new TileLayer({ source: bakgrunnskartSources[id] });

export const bakgrunnskartLayers = {
  stedsnavn: createTileLayerFromBakgrunnskartSource("stedsnavn"),
  grunnkretser: createTileLayerFromBakgrunnskartSource("grunnkretser"),
  administrativeGrenser: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenser"
  ),
  administrativeGrenserHistorisk: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenserHistorisk"
  ),
  topografiskNorgeskart: createTileLayerFromBakgrunnskartSource(
    "topografiskNorgeskart"
  ),
  n5Raster2: createTileLayerFromBakgrunnskartSource("n5Raster2"),
  kartbladinndelinger: createTileLayerFromBakgrunnskartSource(
    "kartbladinndelinger"
  ),
  norgesMaritimeGrenser: createTileLayerFromBakgrunnskartSource(
    "norgesMaritimeGrenser"
  ),
  sjokartDybdedata: createTileLayerFromBakgrunnskartSource("sjokartDybdedata"),
  toporaster4: createTileLayerFromBakgrunnskartSource("toporaster4"),
  stedsnavnSSR: createTileLayerFromBakgrunnskartSource("stedsnavnSSR"),
  historiskeKart: createTileLayerFromBakgrunnskartSource("historiskeKart"),
};

export const grenserLayers = {
  // ingen source betyr at source settes async
  fylker: new VectorLayer({ source: new VectorSource() }),
  kommuner: new VectorLayer({ source: new VectorSource() }),
  edit: new VectorLayer({
    source: new VectorSource(),
    style: new Style({
      stroke: new Stroke({
        color: "red",
      }),
    }),
  }),
};
