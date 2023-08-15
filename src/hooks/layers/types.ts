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

// denne iden brukes både til Sources og Layers
export type LayerId = KartlagId | GrenseId;
