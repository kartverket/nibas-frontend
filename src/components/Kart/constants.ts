import { Overlay } from "ol";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import View from "ol/View";
import { keyframes } from "styled-components";
import { registerProjections } from "utils/map/projections";

registerProjections();

export const initialMapCenter = fromLonLat([2.757933, 52.911491]);
export const initialMapZoom = 6;

// referansene til DOM elementer på objektene under gjøres i Kart.tsx

export const map = new Map({
  view: new View({
    zoom: initialMapZoom,
    center: initialMapCenter,
    projection: "EPSG:25833",
  }),
  layers: [],
  controls: [],
  overlays: [],
  keyboardEventTarget: window.document,
});

export const overlayPopup = new Overlay({
  autoPan: {
    animation: {
      duration: 250,
    },
  },
  offset: [0, 0],
});
