import {
  initialMapCenter,
  initialMapZoom,
  map,
} from "components/Kart/constants";

export const resetMapView = () => {
  const view = map.getView();

  view.animate({
    zoom: initialMapZoom,
    center: initialMapCenter,
    duration: 500,
  });
};
