import { Style } from "ol/style";
import { TegnforklaringProps } from "./Tegnforklaring";
import { grenseStyles } from "utils/map/layerStyles";

const getColorFromStyle = (styles: Style[]): string => {
  const strokeStyle = styles.find((style) => style.getStroke() !== null);
  if (!strokeStyle) {
    return "#000000";
  }
  return strokeStyle.getStroke()?.getColor().toLocaleString() ?? "";
};

const isDottedStyle = (styles: Style[]): boolean => {
  const strokeStyle = styles.find((style) => style.getStroke() !== null);
  if (!strokeStyle) {
    return false;
  }

  const dash = strokeStyle.getStroke()?.getLineDash();
  return !!dash && dash.length > 0;
};

export const tegnforklaringer: TegnforklaringProps[][] = [
  [
    {
      text: "Riksgrense",
      dotted: isDottedStyle(grenseStyles.nasjon),
      color: getColorFromStyle(grenseStyles.nasjon),
    },
    {
      text: "Arkivert riksgrense",
      dotted: isDottedStyle(grenseStyles.archivedNasjon),
      color: getColorFromStyle(grenseStyles.archivedNasjon),
    },
    {
      text: "Fylkesgrense",
      dotted: isDottedStyle(grenseStyles.fylke),
      color: getColorFromStyle(grenseStyles.fylke),
    },
    {
      text: "Arkivert fylkesgrense",
      dotted: isDottedStyle(grenseStyles.archivedFylke),
      color: getColorFromStyle(grenseStyles.archivedFylke),
    },
    {
      text: "Kommunegrense",
      dotted: isDottedStyle(grenseStyles.kommune),
      color: getColorFromStyle(grenseStyles.kommune),
    },
    {
      text: "Arkivert kommunegrense",
      dotted: isDottedStyle(grenseStyles.archivedKommune),
      color: getColorFromStyle(grenseStyles.archivedKommune),
    },
  ],
  [
    {
      text: "Stemmekretsgrense",
      dotted: isDottedStyle(grenseStyles.stemmekrets),
      color: getColorFromStyle(grenseStyles.stemmekrets),
    },
    {
      text: "Arkivert stemmekretsgrense",
      dotted: isDottedStyle(grenseStyles.archivedStemmekrets),
      color: getColorFromStyle(grenseStyles.archivedStemmekrets),
    },
    {
      text: "Grunnkretsgrense",
      dotted: isDottedStyle(grenseStyles.grunnkrets),
      color: getColorFromStyle(grenseStyles.grunnkrets),
    },
    {
      text: "Arkivert grunnkretsgrense",
      dotted: isDottedStyle(grenseStyles.archivedGrunnkrets),
      color: getColorFromStyle(grenseStyles.archivedGrunnkrets),
    },
    {
      text: "Delområdegrense",
      dotted: isDottedStyle(grenseStyles.delomraade),
      color: getColorFromStyle(grenseStyles.delomraade),
    },
    {
      text: "Arkivert delområdegrense",
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
      text: "Matrikkelgrense",
      dotted: isDottedStyle(grenseStyles.matrikkel),
      color: getColorFromStyle(grenseStyles.matrikkel),
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
      text: "Redigert/Ny grense",
      dotted: isDottedStyle(grenseStyles.dirty),
      color: getColorFromStyle(grenseStyles.dirty),
    },
  ],
];
