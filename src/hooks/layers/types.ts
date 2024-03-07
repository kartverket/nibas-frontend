import { EditingType } from "contexts/EditGrenserContext/types";

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

export type GrenseType =
  | "Kommunegrense"
  | "Fylkesgrense"
  | "Riksgrense"
  | "AvtaltAvgrensningslinje"
  | "Territorialgrense"
  | "Grunnkretsgrense"
  | "Delområdegrense"
  | "Posisjon"
  | "Stemmekretsgrense"
  | "GRUNNKRETS"
  | "STEMMEKRETS";

export const getGrenseTypeFromEditingType = (editingType: EditingType): GrenseType | undefined => {
  switch (editingType) {
    case "nasjon":
      return "Riksgrense";

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

export const getEditingTypeFromGrenseType = (grenseType: GrenseType): EditingType | undefined => {
  switch (grenseType) {
    case "Riksgrense":
      return "nasjon";

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
