import { fromLonLat } from "ol/proj";
import Map from "ol/Map";
import View from "ol/View";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";

proj4.defs(
  "EPSG:25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
register(proj4);

const initialCenter = fromLonLat([2.757933, 52.911491]);
const initialZoom = 6;

export const map = new Map({
  view: new View({
    zoom: initialZoom,
    center: initialCenter,
    projection: "EPSG:25833",
  }),
  layers: [],
  controls: [],
  overlays: [],
  keyboardEventTarget: window.document,
});
