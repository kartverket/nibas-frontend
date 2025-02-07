import { archivedSource, editSource } from "hooks/layers/constants";
import { GrenseId, GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import MultiPoint from "ol/geom/MultiPoint";
import Point from "ol/geom/Point";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { StyleFunction } from "ol/style/Style";
import Text from "ol/style/Text";
import { getFeatureFremtidigEndringDato, isFeatureEditable, isMatrikkelFeature } from "utils/features";
import { isGrenseType } from "utils/type-utils";
import { FeatureLike } from "ol/Feature";
import { getRepresentasjonspunktId } from "./source";

const getNonEndpointsOnFeature = (feature: FeatureLike) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof LineString) {
    const coordinates = geometry.getCoordinates();
    return new MultiPoint(coordinates.slice(1, -1));
  }
};

const getEndPointsOnFeature = (feature: FeatureLike) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof LineString) {
    const endCoordinates = [geometry.getFirstCoordinate(), geometry.getLastCoordinate()];
    return new MultiPoint(endCoordinates);
  }
};

const lineAndPointStyles = ({
  color,
  dashed = false,
  points = true,
  lineStrokeWidth = 1.25,
  pointRadius = 2.5,
  endpointStrokeWidth = 2,
  endpointRadius = 3.5,
}: {
  color: string;
  dashed?: boolean;
  points?: boolean;
  lineStrokeWidth?: number;
  pointRadius?: number;
  endpointStrokeWidth?: number;
  endpointRadius?: number;
}) => [
  new Style({
    stroke: new Stroke({
      color,
      lineDash: dashed ? [6, 8] : [],
      width: lineStrokeWidth,
    }),
  }),
  new Style({
    image: new Circle({
      radius: points ? pointRadius : 0,
      fill: new Fill({
        color,
      }),
    }),
    geometry: getNonEndpointsOnFeature,
  }),
  new Style({
    image: new Circle({
      radius: points ? endpointRadius : 0,
      fill: new Fill({
        color: "#FFFFFF",
      }),
      stroke: new Stroke({
        color: color,
        width: endpointStrokeWidth,
      }),
    }),
    geometry: getEndPointsOnFeature,
  }),
];

export const selectedPointStyle = new Style({
  image: new Circle({
    radius: 6,
    stroke: new Stroke({ color: "#D163E6FF", width: 3 }),
    fill: new Fill({ color: "#ffffff" }),
  }),
  fill: new Fill({ color: "#ffffff" }),
  stroke: new Stroke({ color: "#D163E6FF" }),
  zIndex: 10,
});

export const hoveredPointStyle = new Style({
  image: new Circle({
    radius: 6,
    stroke: new Stroke({ color: "#D163E6FF", width: 6 }),
  }),
  fill: new Fill({ color: "#ffffff" }),
  stroke: new Stroke({ color: "#D163E6FF" }),
  zIndex: 10,
});

const flateStyles = [
  new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.05)",
    }),
  }),
];

export const inndelingColors = {
  fylke: "#170CEB",
  kommune: "#637DF3",
  nasjon: "#61538B",
  grunnkrets: "#4D94AF",
  stemmekrets: "#FFAE49FF",
  delomraade: "#5DB9DC",
  fremtidigEndring: "#B92659",
  edit: "#000000",
  measure: "#000000",
};

export const grenseStyles = {
  fylke: lineAndPointStyles({ color: inndelingColors["fylke"] }),
  kommune: lineAndPointStyles({ color: inndelingColors["kommune"] }),
  nasjon: lineAndPointStyles({ color: inndelingColors["nasjon"] }),
  grunnkrets: lineAndPointStyles({ color: inndelingColors["grunnkrets"] }),
  stemmekrets: lineAndPointStyles({ color: inndelingColors["stemmekrets"] }),
  delomraade: lineAndPointStyles({ color: inndelingColors["delomraade"] }),
  edit: lineAndPointStyles({ color: inndelingColors["edit"] }),
  measure: lineAndPointStyles({ color: inndelingColors["measure"], dashed: true }),
  select: lineAndPointStyles({ color: "#D163E6FF" }),
  dirty: lineAndPointStyles({ color: "#00CB85FF" }),
  error: lineAndPointStyles({ color: "#FF0000FF" }),
  fremtidigEndring: lineAndPointStyles({ color: inndelingColors["fremtidigEndring"] }),
  matrikkel: lineAndPointStyles({ color: "#C0AFFBFF", pointRadius: 1.5, endpointRadius: 2 }),
  sammenslaaing: lineAndPointStyles({ color: "#D3C439B3" }),
  flate: flateStyles,
  sammenslaaingOverlapping: lineAndPointStyles({
    color: "#D3C439B3",
    dashed: true,
    points: false,
  }),
  archivedFylke: lineAndPointStyles({ color: inndelingColors["fylke"], dashed: true }),
  archivedKommune: lineAndPointStyles({ color: inndelingColors["kommune"], dashed: true }),
  archivedNasjon: lineAndPointStyles({ color: inndelingColors["nasjon"], dashed: true }),
  archivedGrunnkrets: lineAndPointStyles({ color: inndelingColors["grunnkrets"], dashed: true }),
  archivedStemmekrets: lineAndPointStyles({ color: inndelingColors["stemmekrets"], dashed: true }),
  archivedDelomraade: lineAndPointStyles({ color: inndelingColors["delomraade"], dashed: true }),
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

export const getLayerStyle = (feature: FeatureLike, grenseId: GrenseId, archived: boolean): Style[] => {
  const grenseType = feature.get("type");

  if (getFeatureFremtidigEndringDato(feature) != null) {
    return grenseStyles.fremtidigEndring;
  }

  if (isGrenseType(grenseType)) {
    if (grenseId === "edit" && isFeatureEditable(feature, archived) === true) {
      return grenseStyles.edit;
    }

    return grenseStyleFromType(grenseType, archived || grenseId === "archived");
  }

  if (isMatrikkelFeature(feature)) {
    return grenseStyles.matrikkel;
  }

  return [];
};

export const getArchiveLayerStyle = (feature: FeatureLike): Style[] => {
  const grenseType = feature.get("type");
  if (isGrenseType(grenseType)) {
    return grenseStyleFromType(grenseType, true);
  }
  return [];
};

export const getPointOverlayStyle = (feature: FeatureLike, grenseId: GrenseId) => {
  const name = feature.get("name") as string | undefined;
  const number = feature.get("number") as string | undefined;
  const gyldigTil = feature.get("gyldigTil") as string | undefined;

  if (
    feature.get("type") !== "Posisjon" ||
    name == null ||
    number == null ||
    grenseId === "archived" ||
    grenseId === "matrikkel"
  ) {
    return new Style();
  }

  const getColor = () => {
    if (gyldigTil != null) {
      return inndelingColors["fremtidigEndring"];
    }

    return inndelingColors[grenseId];
  };

  return new Style({
    text: new Text({
      text: `${number} ${name}`,
      font: "bold 16px Mulish, sans-serif",
      fill: new Fill({ color: getColor() }),
      stroke: new Stroke({ width: 3, color: "white" }),
      textBaseline: "middle",
      textAlign: "center",
    }),
    geometry: () => {
      if (feature.getGeometry() instanceof Point) {
        return feature.getGeometry();
      }
    },
  });
};

export const updateRepresentasjonspunkt = (inndelingId: string, number?: string, name?: string) => {
  const feature = editSource.getFeatureById(getRepresentasjonspunktId(inndelingId));
  if (feature) {
    if (number != null) {
      feature.set("number", number);
    }
    if (name != null) {
      feature.set("name", name);
    }
  }
};

/**
 * Liten hjelpefunksjon for å slippe så mye typehåndtering når man skal sette stiler
 * @param featureId En gitt feature i editSource eller archivedSource som skal få ny stil
 * @param style Stil fra grenseStyles eller en stilfunksjon
 */
export const setFeatureStyle = (featureId: string, style: Style[] | StyleFunction) => {
  const sources = [archivedSource, editSource];
  sources.forEach((source) => {
    const feature = source.getFeatureById(featureId) as Feature<Geometry> | null;
    feature?.setStyle(style);
  });
};
