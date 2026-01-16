import { Inndelingtype } from "types/api";

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

export const getInndelingtypeFromGrensetype = (grenseType: GrenseType): Inndelingtype | undefined => {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (grenseType) {
    case "Fylkesgrense":
      return "FYLKE";

    case "Kommunegrense":
      return "KOMMUNE";

    case "Stemmekretsgrense":
      return "STEMMEKRETS";

    case "Grunnkretsgrense":
      return "GRUNNKRETS";

    case "Bopliktgrense":
      return "BOPLIKTOMRAADE";

    default:
      return undefined;
  }
};

// Hjelpefunksjon for å få grenseId literal for en inndelingtype.
// Inneholder altså ikke alle grenseId-er, kun de som samsvarer med inndelingtype.
export const getGrenseIdForInndelingtype = (
  inndelingtype: Inndelingtype,
): Exclude<GrenseId, "archived" | "edit" | "measure" | "historical" | "sosiFiler"> => {
  switch (inndelingtype) {
    case "FYLKE":
      return "fylke";
    case "KOMMUNE":
      return "kommune";
    case "STEMMEKRETS":
      return "stemmekrets";
    case "GRUNNKRETS":
      return "grunnkrets";
    case "BOPLIKTOMRAADE":
      return "bopliktomraade";
    default:
      throw new Error(`Fant ikke grenseId for inndelingtype: ${inndelingtype}`);
  }
};

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagId | GrenseId;
