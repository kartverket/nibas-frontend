import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiPoint from "ol/geom/MultiPoint";
import RenderFeature from "ol/render/Feature";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { map } from "pages/Kart/constants";
import Text from "ol/style/Text";
import Point from "ol/geom/Point";
import { editableBorderTypes, editSource } from "hooks/layers/constants";
import { GrenseId, GrenseType } from "hooks/layers/types";

const getPointsOnFeature = (feature: Feature<Geometry> | RenderFeature) => {
  // hent punkter når zoomet langt nok inn
  const zoom = map.getView().getZoom() ?? 0;

  if (zoom < 11) return;

  const coordinates = (feature as Feature<LineString>)
    .getGeometry()
    ?.getCoordinates();
  return new MultiPoint(coordinates ?? []);
};

const lineAndPointStyles = ({
  color,
  dashed = false,
  points = true,
}: {
  color: string;
  dashed?: boolean;
  points?: boolean;
}) => [
  new Style({
    stroke: new Stroke({
      color,
      lineDash: dashed ? [4, 6] : [],
      width: dashed ? 3 : 2,
    }),
  }),
  new Style({
    image: new Circle({
      radius: points ? 2.5 : 0,
      fill: new Fill({
        color,
      }),
    }),
    geometry: getPointsOnFeature,
  }),
];

export const selectedPointStyle = new Style({
  image: new Circle({
    radius: 6,
    stroke: new Stroke({ color: "#ffffff", width: 2 }),
    fill: new Fill({ color: "#00A76C" }),
  }),
  fill: new Fill({ color: "#00A76C" }),
  stroke: new Stroke({ color: "#ffffff" }),
  zIndex: 10,
});

const flateStyles = [
  new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.05)",
    }),
  }),
];

export const grenseStyles = {
  fylke: lineAndPointStyles({ color: "#B92659" }),
  kommune: lineAndPointStyles({ color: "#F15D4E" }),
  nasjon: lineAndPointStyles({ color: "#91120A" }),
  grunnkrets: lineAndPointStyles({ color: "#3E8DF6" }),
  delomraade: lineAndPointStyles({ color: "#5952D2" }),
  stemmekrets: lineAndPointStyles({ color: "#EBAB3B" }),
  edit: lineAndPointStyles({ color: "#000000" }),
  select: lineAndPointStyles({ color: "#000000", dashed: true }),
  dirty: lineAndPointStyles({ color: "#00A76C", dashed: true }),
  sammenslaaing: lineAndPointStyles({ color: "#D163E6" }),
  flate: flateStyles,
  sammenslaaingOverlapping: lineAndPointStyles({
    color: "#D163E6",
    dashed: true,
    points: false,
  }),
  archived: lineAndPointStyles({ color: "#C8C8C8", dashed: true }),
};

const grenseStyleFromType = (grenseType: GrenseType): Style[] => {
  switch (grenseType) {
    case "Fylkesgrense": {
      return grenseStyles.fylke;
    }
    case "Kommunegrense": {
      return grenseStyles.kommune;
    }
    case "Posisjon":
    case "Territorialgrense":
    case "AvtaltAvgrensningslinje":
    case "Riksgrense": {
      return grenseStyles.nasjon;
    }
    case "Delområdegrense": {
      return grenseStyles.delomraade;
    }
    case "Grunnkretsgrense": {
      return grenseStyles.grunnkrets;
    }
    case "Stemmekretsgrense": {
      return grenseStyles.stemmekrets;
    }
    case "GRUNNKRETS":
    case "STEMMEKRETS": {
      return grenseStyles.flate;
    }
  }
};

export const getLayerStyle = (
  feature: Feature<Geometry> | RenderFeature,
  grenseId: GrenseId
) => {
  const borderIsNotEditable = !editableBorderTypes.includes(
    feature.get("type")
  );
  if (grenseId == "edit" && !borderIsNotEditable) {
    return grenseStyles.edit;
  } else {
    return grenseStyleFromType(feature.getProperties().type as GrenseType);
  }
};

export const getPointOverlayStyle = (
  feature: Feature<Geometry> | RenderFeature
) => {
  if (!feature.get("name") || !feature.get("number")) return new Style();

  return new Style({
    text: new Text({
      text: `${feature.get("number")} ${feature.get("name")}`,
      font: "bold 16px Mulish, sans-serif",
      fill: new Fill({ color: "#FFF" }),
      stroke: new Stroke({ width: 2 }),
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
  if (feature) {
    if (name) {
      feature.set("name", name);
    }
    if (number) {
      feature.set("number", number);
    }
  }
};
