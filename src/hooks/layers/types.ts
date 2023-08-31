import { EditingType } from "contexts/EditGrenserContext";
import { kartlagLayers } from "./constants";

export type KartlagId = keyof typeof kartlagLayers;
export type GrenseId =
  | "fylke"
  | "kommune"
  | "nasjon"
  | "grunnkrets"
  | "stemmekrets"
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
  | "Stemmekretsgrense";

export const getGrenseTypeFromEditingType = (editingType: EditingType) => {
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

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagId | GrenseId;
