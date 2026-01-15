import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";

export type KartlagId =
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

export type GrenseId =
  | "matrikkel"
  | "fylke"
  | "kommune"
  | "nasjon"
  | "grunnkrets"
  | "stemmekrets"
  | "archived"
  | "edit"
  | "measure"
  | "historical"
  | "sosiFiler"
  | "bopliktomraade";

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
    case "fylke":
      return "Fylkesgrense";

    case "kommune":
      return "Kommunegrense";

    case "stemmekrets":
      return "Stemmekretsgrense";

    case "grunnkrets":
      return "Grunnkretsgrense";

    case "bopliktomraade":
      return "Bopliktgrense";

    default:
      break;
  }
};

export const getInndelingtypeFromGrensetype = (grenseType: GrenseType): Inndelingtype | undefined => {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (grenseType) {
    case "Fylkesgrense":
      return "fylke";

    case "Kommunegrense":
      return "kommune";

    case "Stemmekretsgrense":
      return "stemmekrets";

    case "Grunnkretsgrense":
      return "grunnkrets";

    case "Bopliktgrense":
      return "bopliktomraade";

    default:
      return undefined;
  }
};

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagId | GrenseId;
