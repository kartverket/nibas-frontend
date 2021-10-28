import { get } from "ol/proj";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import TileWMS from "ol/source/TileWMS";
import { SyncSourceId, SyncSources } from "./types";

const geo1 = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        kind: "county",
        name: "Wyandotte",
        state: "KS",
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-94.8627, 39.202],
              [-94.901, 39.202],
              [-94.9065, 38.9884],
              [-94.8682, 39.0596],
              [-94.6053, 39.0432],
              [-94.6053, 39.1144],
              [-94.5998, 39.1582],
              [-94.7422, 39.1691],
              [-94.7751, 39.202],
              [-94.8627, 39.202],
            ],
            [
              [-96.8627, 37.202],
              [-96.901, 37.202],
              [-96.9065, 36.9884],
              [-96.8682, 37.0596],
              [-96.6053, 37.0432],
              [-96.6053, 37.1144],
              [-96.5998, 37.1582],
              [-96.7422, 37.1691],
              [-96.7751, 37.202],
              [-96.8627, 37.202],
            ],
            [
              [-98.8627, 35.202],
              [-98.901, 35.202],
              [-98.9065, 34.9884],
              [-98.8682, 35.0598],
              [-98.6053, 35.0432],
              [-98.6053, 35.1144],
              [-98.5998, 35.1582],
              [-98.7422, 35.1691],
              [-98.7751, 35.202],
              [-98.8627, 35.202],
            ],
          ],
        ],
      },
    },
  ],
};

const vectorSource = new VectorSource({
  features: new GeoJSON().readFeatures(geo1, {
    featureProjection: get("EPSG:25833"),
  }),
});

const tileSource = new XYZ({
  url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
});

const administrativeEnheterSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
  params: { LAYERS: "adm_enheter_V2_WMS", CRS: "EPSG:25833" },
});

const matrikkelenSource = new TileWMS({
  url: "https://wms.geonorge.no/skwms1/wms.matrikkel.v1?service=WMS",
  params: { LAYERS: "matrikkel:GATEADRESSEWFS", CRS: "EPSG:4326" },
  // tileLoadFunction: async (tile, src) => {
  //   const response = await fetch(src);
  //   console.log(response);
  // },
});

const stedsnavnSource = new TileWMS({
  url: "http://openwms.statkart.no/skwms1/wms.stedsnavnenkel?version=1.3.0&service=wms",
  params: { LAYERS: "stedsnavnenkel", CRS: "EPSG:25833", format: "image/png" },
});
// stedsnavnSource.updateParams({});

const topografiskNorgeskartSource = new TileWMS({
  url: "https://openwms.statkart.no/skwms1/wms.topo4?service=wms",
  params: { LAYERS: "topo4_WMS", CRS: "EPSG:25833", format: "image/png" },
});

export const syncSources: SyncSources = {
  administrativeGrenser: administrativeEnheterSource,
  background: tileSource,
  matrikkelen: matrikkelenSource,
  stedsnavn: stedsnavnSource,
  vector: vectorSource,
  topografiskNorgeskart: topografiskNorgeskartSource,
};

// sett id på alle sources for å gjøre de mulig å sjekke opp med layers
(() => {
  Object.keys(syncSources).forEach((id) =>
    syncSources[id as SyncSourceId].set("id", id)
  );
})();
