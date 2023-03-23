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
import { editableBorderTypes, editSource } from "hooks/layers/constants";
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

const lineAndPointStyles = (
  color: string,
  dashed = false,
  pointsOnLine = true
) => [
  new Style({
    stroke: new Stroke({
      color,
      lineDash: dashed ? [4, 6] : [],
      width: 2,
    }),
  }),
  new Style({
    image: new Circle({
      radius: pointsOnLine ? 4 : 0,
      fill: new Fill({
        color,
      }),
    }),
    geometry: getPointsOnFeature,
  }),
];

export const editStyles = lineAndPointStyles("#000000");
export const dirtyStyles = lineAndPointStyles("#B93D54", true);
export const dirtySammenslaaingStyles = lineAndPointStyles("#1C8870");
export const dirtyOverlappingSammenslaaingStyles = lineAndPointStyles(
  "#B93D54",
  true,
  false
);
export const selectStyles = lineAndPointStyles("#EB48FB");
export const grensetypeStyles: Record<GrenseId, Style[]> = {
  fylke: lineAndPointStyles("#186D9F"),
  kommune: lineAndPointStyles("#4FB7C0"),
  nasjon: lineAndPointStyles("#104C79"),
  grunnkrets: lineAndPointStyles("#FFD34C"),
  stemmekrets: lineAndPointStyles("#FCAE53"),
  edit: editStyles,
};

export const getLayerStyle = (
  feature: Feature<Geometry> | RenderFeature,
  grenseId: GrenseId
) => {
  const borderIsNotEditable = !editableBorderTypes.includes(
    feature.get("type")
  );
  if (grenseId == "edit" && borderIsNotEditable) {
    const grensetype = feature.getProperties().inndelingerKontekst
      .type as GrenseId;
    return grensetypeStyles[grensetype];
  } else {
    return grensetypeStyles[grenseId];
  }
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
