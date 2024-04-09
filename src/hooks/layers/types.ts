import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";

export type KartlagId =
  | "cachetjenester"
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
  | "edit";

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
  "GRUNNKRETS",
  "STEMMEKRETS",
] as const;

export type GrenseType = (typeof GRENSETYPER)[number];

export const editableGrenseTypes: GrenseType[] = [
  "Delområdegrense",
  "Grunnkretsgrense",
  "Stemmekretsgrense",
  "Kommunegrense",
];

export const getGrenseTypeFromKretstype = (kretstype: Inndelingtype): GrenseType | undefined => {
  switch (kretstype) {
    case "fylke":
      return "Fylkesgrense";

    case "kommune":
      return "Kommunegrense";

    case "stemmekrets":
      return "Stemmekretsgrense";

    case "grunnkrets":
      return "Grunnkretsgrense";

    default:
      break;
  }
};

export const getKretstypeFromGrensetype = (grenseType: GrenseType): Inndelingtype | undefined => {
  switch (grenseType) {
    case "Fylkesgrense":
      return "fylke";

    case "Kommunegrense":
      return "kommune";

    case "Stemmekretsgrense":
      return "stemmekrets";

    case "Grunnkretsgrense":
      return "grunnkrets";

    default:
      break;
  }
};

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagId | GrenseId;
