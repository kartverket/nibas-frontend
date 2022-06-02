import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Style from "ol/style/Style";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import Fill from "ol/style/Fill";
import MultiPoint from "ol/geom/MultiPoint";
import LineString from "ol/geom/LineString";
import { Feature } from "ol";
import Point from "ol/geom/Point";

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

const defaultStyles = new Style({
  stroke: new Stroke({
    color: "#0062FF",
  }),
});

const pointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: "#FF00FF",
    }),
  }),
  geometry: (feature) => {
    // return the coordinates of the first ring of the polygon
    const coordinates = (feature as Feature<LineString>)
      .getGeometry()
      ?.getCoordinates();
    console.log(coordinates);
    return new MultiPoint(coordinates ?? []);
  },
});

export const grenserLayers = {
  // ingen source betyr at source settes async
  fylker: new VectorLayer({ source: new VectorSource(), style: defaultStyles }),
  kommuner: new VectorLayer({
    source: new VectorSource(),
    style: defaultStyles,
  }),
  nasjoner: new VectorLayer({
    source: new VectorSource(),
    style: defaultStyles,
  }),
  grunnkretser: new VectorLayer({
    source: new VectorSource(),
    style: defaultStyles,
  }),
  edit: new VectorLayer({
    source: new VectorSource(),
    style: [
      new Style({
        stroke: new Stroke({
          color: "#FF00FF",
        }),
      }),
      // pointStyle,
    ],
  }),
};
