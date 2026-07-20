import Map from "ol/Map";
import View from "ol/View";
import { Extent } from "ol/extent";
import { defaults } from "ol/interaction/defaults";
import { fromLonLat } from "ol/proj";
import { mapProjectionEPSGCode, registerAllUsedProjections } from "utils/map/projections";

registerAllUsedProjections();

export const norwayExtent: Extent = [
  ...fromLonLat([4, 57], mapProjectionEPSGCode),
  ...fromLonLat([34, 71], mapProjectionEPSGCode),
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
    projection: mapProjectionEPSGCode,
  }),
  layers: [],
  controls: [],
  overlays: [],
  keyboardEventTarget: window.document,
  interactions: defaults({ altShiftDragRotate: false, dragPan: false, shiftDragZoom: false, doubleClickZoom: false }),
  maxTilesLoading: Infinity,
});
