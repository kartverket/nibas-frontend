import { Overlay } from "ol";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import View from "ol/View";
import { registerProjections } from "utils/map/projections";

registerProjections();

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

export const overlayPopup = new Overlay({
  // offset: [10, -10],
  positioning: "bottom-left",
});
