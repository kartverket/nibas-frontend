import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { kartlagSources } from "hooks/sources/syncSources";
import { getPointOverlayStyle, getLayerStyle } from "utils/map/layerStyles";
import { StyleFunction } from "ol/style/Style";
import { GrenseId, KartlagId } from "./types";
import WMTS from "ol/source/WMTS";
import TileWMS from "ol/source/TileWMS";
import { bbox } from "ol/loadingstrategy";
import { GeoJSON } from "ol/format";

const createTileLayerFromKartlagSource = (id: keyof typeof kartlagSources) =>
  new TileLayer({ source: kartlagSources[id] });

export const kartlagLayers: Record<
  KartlagId,
  TileLayer<TileWMS | WMTS> | VectorLayer<VectorSource>
> = {
  europaKart: createTileLayerFromKartlagSource("europaKart"),
  topoWMTS: createTileLayerFromKartlagSource("topoWMTS"),
  topografiskNorgeskart: createTileLayerFromKartlagSource(
    "topografiskNorgeskart",
  ),
  administrativeGrenser: createTileLayerFromKartlagSource(
    "administrativeGrenser",
  ),
  administrativeGrenserHistorisk: createTileLayerFromKartlagSource(
    "administrativeGrenserHistorisk",
  ),
  grunnkretserWMS: createTileLayerFromKartlagSource("grunnkretserWMS"),
  stedsnavn: createTileLayerFromKartlagSource("stedsnavn"),
  stedsnavnSSR: createTileLayerFromKartlagSource("stedsnavnSSR"),
  kartbladinndelinger: createTileLayerFromKartlagSource("kartbladinndelinger"),
  sjokartDybdedata: createTileLayerFromKartlagSource("sjokartDybdedata"),
  n5Raster2: createTileLayerFromKartlagSource("n5Raster2"),
  historiskeKart: createTileLayerFromKartlagSource("historiskeKart"),
  norgeIBilder: createTileLayerFromKartlagSource("norgeIBilder"),
  cachetjenester: createTileLayerFromKartlagSource("cachetjenester"),
  norgesMaritimeGrenser: createTileLayerFromKartlagSource(
    "norgesMaritimeGrenser",
  ),
  sjokartElektroniske: createTileLayerFromKartlagSource("sjokartElektroniske"),
  matrikkelenWfs: new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return (
          "/geoservergeo/wfs/matrikkel?SERVICE=WFS&" +
          "VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=TEIGGRENSEWFS&" +
          "OUTPUTFORMAT=application/json&SRSNAME=EPSG:25833&" +
          "BBOX=" +
          extent.join(",") +
          ",EPSG:25833"
        );
      },
      strategy: bbox,
    }),
  }),
};

export const editSource = new VectorSource();

const grenseStyle =
  (grenseId: GrenseId): StyleFunction =>
  (feature) => [
    ...getLayerStyle(feature, grenseId, false),
    getPointOverlayStyle(feature),
  ];

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
