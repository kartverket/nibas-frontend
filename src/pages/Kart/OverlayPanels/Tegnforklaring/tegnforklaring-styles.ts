import { Style } from "ol/style";
import { TegnforklaringProps } from "./Tegnforklaring";
import { grenseStyles } from "utils/map/layerStyles";

const getColorFromStyle = (styles: Style[]): string => {
  const strokeStyle = styles.find((style) => style.getStroke() != null);
  if (strokeStyle == null) {
    return "#000000";
  }

  return strokeStyle.getStroke().getColor().toLocaleString();
};

const isDottedStyle = (styles: Style[]): boolean => {
  const strokeStyle = styles.find((style) => style.getStroke() != null);
  if (strokeStyle == null) {
    return false;
  }

  const dash = strokeStyle.getStroke().getLineDash();
  return dash != null && dash.length > 0;
};

export const tegnforklaringer: TegnforklaringProps[][] = [
  [
    {
      text: "Nasjon",
      dotted: isDottedStyle(grenseStyles.nasjon),
      color: getColorFromStyle(grenseStyles.nasjon),
    },
    {
      text: "Arkivert nasjon",
      dotted: isDottedStyle(grenseStyles.archivedNasjon),
      color: getColorFromStyle(grenseStyles.archivedNasjon),
    },
    {
      text: "Fylke",
      dotted: isDottedStyle(grenseStyles.fylke),
      color: getColorFromStyle(grenseStyles.fylke),
    },
    {
      text: "Arkivert fylke",
      dotted: isDottedStyle(grenseStyles.archivedFylke),
      color: getColorFromStyle(grenseStyles.archivedFylke),
    },
    {
      text: "Kommune",
      dotted: isDottedStyle(grenseStyles.kommune),
      color: getColorFromStyle(grenseStyles.kommune),
    },
    {
      text: "Arkivert kommune",
      dotted: isDottedStyle(grenseStyles.archivedKommune),
      color: getColorFromStyle(grenseStyles.archivedKommune),
    },
  ],
  [
    {
      text: "Stemmekrets",
      dotted: isDottedStyle(grenseStyles.stemmekrets),
      color: getColorFromStyle(grenseStyles.stemmekrets),
    },
    {
      text: "Arkivert stemmekrets",
      dotted: isDottedStyle(grenseStyles.archivedStemmekrets),
      color: getColorFromStyle(grenseStyles.archivedStemmekrets),
    },
    {
      text: "Grunnkrets",
      dotted: isDottedStyle(grenseStyles.grunnkrets),
      color: getColorFromStyle(grenseStyles.grunnkrets),
    },
    {
      text: "Arkivert grunnkrets",
      dotted: isDottedStyle(grenseStyles.archivedGrunnkrets),
      color: getColorFromStyle(grenseStyles.archivedGrunnkrets),
    },
    {
      text: "Delområde",
      dotted: isDottedStyle(grenseStyles.delomraade),
      color: getColorFromStyle(grenseStyles.delomraade),
    },
    {
      text: "Arkivert delområde",
      dotted: isDottedStyle(grenseStyles.archivedDelomraade),
      color: getColorFromStyle(grenseStyles.archivedDelomraade),
    },
  ],
  [
    {
      text: "Sammenslått flate",
      dotted: isDottedStyle(grenseStyles.sammenslaaing),
      color: getColorFromStyle(grenseStyles.sammenslaaing),
    },
    {
      text: "Sammenslått utgående grense",
      dotted: isDottedStyle(grenseStyles.sammenslaaingOverlapping),
      color: getColorFromStyle(grenseStyles.sammenslaaingOverlapping),
    },
  ],
  [
    {
      text: "Mulig å redigere",
      dotted: isDottedStyle(grenseStyles.edit),
      color: getColorFromStyle(grenseStyles.edit),
    },
    {
      text: "Valgt grense",
      dotted: isDottedStyle(grenseStyles.select),
      color: getColorFromStyle(grenseStyles.select),
    },
    {
      text: "Har blitt redigert",
      dotted: isDottedStyle(grenseStyles.dirty),
      color: getColorFromStyle(grenseStyles.dirty),
    },
  ],
];
