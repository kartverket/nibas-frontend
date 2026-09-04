import { Inndelingtype } from "types/api";

export type KartlagLayerId =
  | "topograatone"
  | "matrikkelenWMS"
  | "administrativeGrenser"
  | "administrativeGrenserHistorisk"
  | "grunnkretserWMS"
  | "stedsnavn"
  | "stedsnavnSSR"
  | "kartbladinndelinger"
  | "sjokartDybdedata"
  | "n5Raster2"
  | "historiskeKart"
  | "norgeIBilder"
  | "norgesMaritimeGrenser"
  | "sjokartElektroniske";

export type VectorLayerId = Inndelingtype | "matrikkel" | "archived" | "edit" | "measure" | "historical" | "sosiFiler";
export type HighlightVectorLayerId = "flateHighlight" | "strokeHighlight" | "pointsHighlight";

export const GRENSETYPER = [
  "Kommunegrense",
  "Fylkesgrense",
  "Riksgrense",
  "AvtaltAvgrensningslinje",
  "Territorialgrense",
  "Grunnkretsgrense",
  "Delområdegrense",
  "Posisjon",
  "Stemmekretsgrense",
  "Bopliktgrense",
  "GRUNNKRETS",
  "STEMMEKRETS",
  "BOPLIKTOMRAADE",
] as const;

export type GrenseType = (typeof GRENSETYPER)[number];

export const editableGrenseTypes: GrenseType[] = [
  "Delområdegrense",
  "Grunnkretsgrense",
  "Stemmekretsgrense",
  "Kommunegrense",
  "Fylkesgrense",
  "Territorialgrense",
  "Riksgrense",
  "AvtaltAvgrensningslinje",
  "Bopliktgrense",
];

export const getGrensetypeFromInndelingtype = (inndelingtype: Inndelingtype): GrenseType | undefined => {
  switch (inndelingtype) {
    case "FYLKE":
      return "Fylkesgrense";

    case "KOMMUNE":
      return "Kommunegrense";

    case "STEMMEKRETS":
      return "Stemmekretsgrense";

    case "GRUNNKRETS":
      return "Grunnkretsgrense";

    case "BOPLIKTOMRAADE":
      return "Bopliktgrense";

    default:
      break;
  }
};

/**
 * @param grenseType grensetype man ønsker inndelingtype for
 * @returns Inndelingtype for en gitt grensetype, null hvis grensetypen ikke har en inndelingtype.
 */
export const getInndelingtypeFromGrensetype = (grenseType: GrenseType): Inndelingtype | null => {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (grenseType) {
    case "Fylkesgrense":
      return "FYLKE";

    case "Kommunegrense":
      return "KOMMUNE";

    case "Stemmekretsgrense":
      return "STEMMEKRETS";

    case "Grunnkretsgrense":
    case "Delområdegrense":
      return "GRUNNKRETS";

    case "Bopliktgrense":
      return "BOPLIKTOMRAADE";

    default:
      return null;
  }
};

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagLayerId | VectorLayerId | HighlightVectorLayerId;
