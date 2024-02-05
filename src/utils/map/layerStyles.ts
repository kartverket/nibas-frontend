import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiPoint from "ol/geom/MultiPoint";
import RenderFeature from "ol/render/Feature";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { StyleFunction } from "ol/style/Style";
import { map } from "pages/Kart/constants";
import Text from "ol/style/Text";
import Point from "ol/geom/Point";
import { editSource } from "hooks/layers/constants";
import { GrenseId, GrenseType } from "hooks/layers/types";
import { featureIsEditable } from "utils/features";

const getNonEndpointsOnFeature = (feature: Feature<Geometry> | RenderFeature) => {
  const featureGeometry = feature.getGeometry();
  if (!(featureGeometry instanceof LineString) || !featureGeometry) return;

  const coordinates = featureGeometry.getCoordinates();

  return new MultiPoint(coordinates.slice(1, -1));
};

const getEndPointsOnFeature = (feature: Feature<Geometry> | RenderFeature) => {
  const featureGeometry = feature.getGeometry();
  if (!(featureGeometry instanceof LineString) || !featureGeometry) return;

  const endCoordinates = [featureGeometry.getFirstCoordinate(), featureGeometry.getLastCoordinate()];

  return new MultiPoint(endCoordinates);
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
    geometry: getNonEndpointsOnFeature,
  }),
  new Style({
    image: new Circle({
      radius: points ? 2.5 : 0,
      fill: new Fill({
        color: "#FFFFFF",
      }),
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
    }),
    geometry: getEndPointsOnFeature,
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
  stemmekrets: lineAndPointStyles({ color: "#EBAB3B" }),
  delomraade: lineAndPointStyles({ color: "#5952D2" }),
  edit: lineAndPointStyles({ color: "#000000" }),
  select: lineAndPointStyles({ color: "#00CB85FF", dashed: true }),
  dirty: lineAndPointStyles({ color: "#005900E6", dashed: true }),
  sammenslaaing: lineAndPointStyles({ color: "#D163E6" }),
  flate: flateStyles,
  sammenslaaingOverlapping: lineAndPointStyles({
    color: "#D163E6",
    dashed: true,
    points: false,
  }),
  archivedFylke: lineAndPointStyles({ color: "#B92659", dashed: true }),
  archivedKommune: lineAndPointStyles({ color: "#F15D4E", dashed: true }),
  archivedNasjon: lineAndPointStyles({ color: "#91120A", dashed: true }),
  archivedGrunnkrets: lineAndPointStyles({ color: "#3E8DF6", dashed: true }),
  archivedStemmekrets: lineAndPointStyles({ color: "#EBAB3B", dashed: true }),
  archivedDelomraade: lineAndPointStyles({ color: "#5952D2", dashed: true }),
};

const grenseStyleFromType = (grenseType: GrenseType, archived: boolean): Style[] => {
  switch (grenseType) {
    case "Fylkesgrense": {
      return archived ? grenseStyles.archivedFylke : grenseStyles.fylke;
    }
    case "Kommunegrense": {
      return archived ? grenseStyles.archivedKommune : grenseStyles.kommune;
    }
    case "Posisjon":
    case "Territorialgrense":
    case "AvtaltAvgrensningslinje":
    case "Riksgrense": {
      return archived ? grenseStyles.archivedNasjon : grenseStyles.nasjon;
    }
    case "Delområdegrense": {
      return archived ? grenseStyles.archivedDelomraade : grenseStyles.delomraade;
    }
    case "Grunnkretsgrense": {
      return archived ? grenseStyles.archivedGrunnkrets : grenseStyles.grunnkrets;
    }
    case "Stemmekretsgrense": {
      return archived ? grenseStyles.archivedStemmekrets : grenseStyles.stemmekrets;
    }
    case "GRUNNKRETS":
    case "STEMMEKRETS": {
      return grenseStyles.flate;
    }
  }
};

export const getLayerStyle = (feature: Feature<Geometry> | RenderFeature, grenseId: GrenseId, archived: boolean) => {
  if (grenseId == "edit" && featureIsEditable(feature, archived)) {
    return grenseStyles.edit;
  } else {
    return grenseStyleFromType(feature.getProperties().type as GrenseType, archived);
  }
};

export const getArchiveLayerStyle = (feature: Feature<Geometry> | RenderFeature) => {
  return grenseStyleFromType(feature.getProperties().type as GrenseType, true);
};

export const getPointOverlayStyle = (feature: Feature<Geometry> | RenderFeature) => {
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

export const updateEditFeatureText = (featureId: string, name?: string, number?: string) => {
  const feature = editSource.getFeatureById(featureId) as Feature<Geometry> | null;
  if (feature) {
    if (name) {
      feature.set("name", name);
    }
    if (number) {
      feature.set("number", number);
    }
  }
};

/**
 * Liten hjelpefunksjon for å slippe så mye typehåndtering når man skal sette stiler
 * @param featureId En gitt feature i editSource som skal få ny stil
 * @param style Stil fra grenseStyles eller en stilfunksjon
 */
export const setFeatureStyle = (featureId: string, style: Style[] | StyleFunction) => {
  const feature = editSource.getFeatureById(featureId) as Feature<Geometry> | null;
  feature?.setStyle(style);
};
