import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiPoint from "ol/geom/MultiPoint";
import RenderFeature from "ol/render/Feature";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { map } from "components/Kart/constants";

const getPointsOnFeature = (feature: Feature<Geometry> | RenderFeature) => {
  // hent punkter når zoomet langt nok inn
  const zoom = map.getView().getZoom() ?? 0;

  if (zoom < 13) return;

  const coordinates = (feature as Feature<LineString>)
    .getGeometry()
    ?.getCoordinates();
  return new MultiPoint(coordinates ?? []);
};

const defaultStyle = new Style({
  stroke: new Stroke({
    color: "#0062FF",
  }),
});

const editStyle = new Style({
  stroke: new Stroke({
    color: "#FF00FF",
  }),
});

const dirtyStyle = new Style({
  stroke: new Stroke({
    color: "#30FF00",
  }),
});

const editPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: "#FF00FF",
    }),
  }),
  geometry: getPointsOnFeature,
});

const dirtyPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: "#30FF00",
    }),
  }),
  geometry: getPointsOnFeature,
});

const defaultPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: "#0062FF",
    }),
  }),
  geometry: getPointsOnFeature,
});

export const defaultStyles = [defaultStyle, defaultPointStyle];
export const editStyles = [editStyle, editPointStyle];
export const dirtyStyles = [dirtyStyle, dirtyPointStyle];
