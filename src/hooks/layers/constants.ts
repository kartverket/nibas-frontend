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
  administrativeGrenser: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenser"
  ),
  administrativeGrenserHistorisk: createTileLayerFromBakgrunnskartSource(
    "administrativeGrenserHistorisk"
  ),
  grunnkretser: createTileLayerFromBakgrunnskartSource("grunnkretser"),
  stedsnavn: createTileLayerFromBakgrunnskartSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromBakgrunnskartSource("stedsnavnSSR"),
  kartbladinndelinger: createTileLayerFromBakgrunnskartSource(
    "kartbladinndelinger"
  ),
  sjokartDybdedata: createTileLayerFromBakgrunnskartSource("sjokartDybdedata"),
  n5Raster2: createTileLayerFromBakgrunnskartSource("n5Raster2"),
  historiskeKart: createTileLayerFromBakgrunnskartSource("historiskeKart"),
  topografiskNorgeskart: createTileLayerFromBakgrunnskartSource(
    "topografiskNorgeskart"
  ),
  topografiskNorgeskartGraatone: createTileLayerFromBakgrunnskartSource(
    "topografiskNorgeskartGraatone"
  ),
  toporaster4: createTileLayerFromBakgrunnskartSource("toporaster4"),
  norgesMaritimeGrenser: createTileLayerFromBakgrunnskartSource(
    "norgesMaritimeGrenser"
  ),
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
