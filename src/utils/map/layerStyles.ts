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

const getDefaultSelectStyle = () => {
  const styles: Record<string, Style | Style[]> = {};
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

export const defaultStyles = [defaultStyle, defaultPointStyle];
export const editStyles = [editStyle, editPointStyle];
export const dirtyStyles = [dirtyStyle, dirtyPointStyle];
export const selectStyles = [
  ...(getDefaultSelectStyle().LineString as Style[]),
  selectPointStyle,
];
