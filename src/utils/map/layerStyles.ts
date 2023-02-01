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

const getDefaultSelectStyle = () => {
  const styles: Record<string, Style[]> = {};
  const white = [255, 255, 255, 1];
  const blue = [0, 153, 255, 1];
  const width = 3;
  styles["Polygon"] = [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
    }),
  ];
  styles["MultiPolygon"] = styles["Polygon"];
  styles["LineString"] = [
    new Style({
      stroke: new Stroke({
        color: white,
        width: width + 2,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: blue,
        width: width,
      }),
    }),
  ];
  styles["MultiLineString"] = styles["LineString"];

  styles["Circle"] = styles["Polygon"].concat(styles["LineString"]);

  styles["Point"] = [
    new Style({
      image: new Circle({
        radius: width * 2,
        fill: new Fill({
          color: blue,
        }),
        stroke: new Stroke({
          color: white,
          width: width / 2,
        }),
      }),
      zIndex: Infinity,
    }),
  ];
  styles["MultiPoint"] = styles["Point"];
  styles["GeometryCollection"] = styles["Polygon"].concat(
    styles["LineString"],
    styles["Point"]
  );

  return styles;
};

const selectPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: [0, 153, 255, 1],
    }),
  }),
  geometry: getPointsOnFeature,
});

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

type StyleFunction = (feature: Feature<Geometry> | RenderFeature) => Style[];

export const getDefaultStyles: StyleFunction = (feature) => {
  return [defaultStyle, defaultPointStyle, getPointOverlayStyle(feature)];
};

export const getEditStyles: StyleFunction = (feature) => {
  return [editStyle, editPointStyle, getPointOverlayStyle(feature)];
};

export const defaultStyles = [defaultStyle, defaultPointStyle];
export const editStyles = [editStyle, editPointStyle];
export const dirtyStyles = [dirtyStyle, dirtyPointStyle];
export const modifiedStyles = [dirtyStyle, dirtyPointStyle];
export const selectStyles = [
  ...getDefaultSelectStyle().LineString,
  selectPointStyle,
];

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
