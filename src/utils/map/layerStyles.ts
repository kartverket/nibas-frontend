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
import Text from "ol/style/Text";
import Point from "ol/geom/Point";
import { editSource } from "hooks/layers/constants";
import { GrenseId } from "hooks/layers/types";

const getPointsOnFeature = (feature: Feature<Geometry> | RenderFeature) => {
  // hent punkter når zoomet langt nok inn
  const zoom = map.getView().getZoom() ?? 0;

  if (zoom < 13) return;

  const coordinates = (feature as Feature<LineString>)
    .getGeometry()
    ?.getCoordinates();
  return new MultiPoint(coordinates ?? []);
};

const lineAndPointStyles = (color: string, dashed = false) => [
  new Style({
    stroke: new Stroke({
      color,
      lineDash: dashed ? [4, 6] : [],
      width: dashed ? 2 : 1,
    }),
  }),
  new Style({
    image: new Circle({
      radius: 3,
      fill: new Fill({
        color,
      }),
    }),
    geometry: getPointsOnFeature,
  }),
];

export const dirtyStyles = lineAndPointStyles("#000000", true);
export const selectStyles = lineAndPointStyles("#000000");
export const grensetypeStyles: Record<GrenseId, Style[]> = {
  fylker: lineAndPointStyles("#D8833B"),
  kommuner: lineAndPointStyles("#EA33F7"),
  nasjoner: lineAndPointStyles("#FF5555"),
  grunnkretser: lineAndPointStyles("#65C97A"),
  stemmekretser: lineAndPointStyles("#5296D5"),
  edit: lineAndPointStyles("#FF5555"),
};

export const getPointOverlayStyle = (
  feature: Feature<Geometry> | RenderFeature
) => {
  if (!feature.get("name") || !feature.get("number")) return new Style();

  return new Style({
    text: new Text({
      text: `${feature.get("name")}\n${feature.get("number")}`,
      font: "12px Arial,sans-serif",
      fill: new Fill({
        color: "#000",
      }),
      padding: [5, 5, 5, 5],
      backgroundFill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
      textBaseline: "middle",
      textAlign: "center",
    }),
    geometry: () => {
      const zoom = map.getView().getZoom() ?? 0;

      if (!(feature.getGeometry() instanceof Point) || zoom < 12) {
        return;
      }

      return feature.getGeometry();
    },
  });
};

export const updateEditFeatureText = (
  featureId: string,
  name?: string,
  number?: string
) => {
  const feature = editSource.getFeatureById(featureId);
  if (name) {
    feature.set("name", name);
  }
  if (number) {
    feature.set("number", number);
  }
};
