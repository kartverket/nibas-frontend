import { Overlay } from "ol";
import Map from "ol/Map";
import View from "ol/View";
import { Extent } from "ol/extent";
import { defaults } from "ol/interaction/defaults";
import { fromLonLat } from "ol/proj";
import { defaultProjectionEpsgCode, registerDefaultProjection } from "utils/map/projections";

registerDefaultProjection();

export const norwayExtent: Extent = [
  ...fromLonLat([4, 57], defaultProjectionEpsgCode),
  ...fromLonLat([34, 71], defaultProjectionEpsgCode),
];

export const initialMapCenter = fromLonLat([2.757933, 52.911491]);
export const initialMapZoom = 6;

// referansene til DOM elementer på objektene under gjøres i Kart.tsx
export const map = new Map({
  view: new View({
    zoom: initialMapZoom,
    minZoom: initialMapZoom,
    maxZoom: 30,
    center: initialMapCenter,
    projection: defaultProjectionEpsgCode,
  }),
  layers: [],
  controls: [],
  overlays: [],
  keyboardEventTarget: window.document,
  interactions: defaults({ altShiftDragRotate: false, dragPan: false, shiftDragZoom: false }),
  maxTilesLoading: Infinity,
});

export const overlayPopup = new Overlay({
  autoPan: {
    animation: {
      duration: 250,
    },
  },
  offset: [0, 0],
});

export const endringstyper = [
  "Vedtatt grensejustering",
  "Vedtatt sammenslåing",
  "Vedtatt deling",
  "Fastsetting",
  "Kvalitetsheving",
  "Navneendring",
  "Nummerendring",
  "Retting",
] as const;
export type Endringstype = (typeof endringstyper)[number];
