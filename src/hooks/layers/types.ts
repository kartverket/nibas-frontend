import { bakgrunnskartLayers } from "./constants";

export type BakgrunnskartId = keyof typeof bakgrunnskartLayers;
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
export type LayerId = BakgrunnskartId | GrenseId;

export type ByLayerId<T> = {
  [Property in LayerId]: T;
};
