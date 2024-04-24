import { GrenseType } from "hooks/layers/types";

const administrativeGrenser: GrenseType[] = [
  "Kommunegrense",
  "Fylkesgrense",
  "Riksgrense",
  "AvtaltAvgrensningslinje",
  "Territorialgrense",
];

export const isAdministrativGrense = (grenseType: GrenseType): boolean => {
  return administrativeGrenser.includes(grenseType);
};

export const isKommuneGrense = (grenseType: GrenseType): boolean => {
  return grenseType === "Kommunegrense";
};

export type MetadataDiscriminator =
  | "FlateMetadata"
  | "AdministrativGrenseMetadata"
  | "RiksgrenseMetadata"
  | "TerritorialgrenseMetadata"
  | "AvtaltAvgrensningslinjeMetadata"
  | "GrunnlinjeMetadata"
  | "StatistiskgrenseMetadata"
  | "KommunalKretsgrenseMetadata";

export const getMetadataDiscriminatorFromType = (grenseType: GrenseType | string): MetadataDiscriminator | null => {
  switch (grenseType) {
    case "Fylkesgrense":
    case "Kommunegrense":
      return "AdministrativGrenseMetadata";
    case "Riksgrense":
      return "RiksgrenseMetadata";
    case "AvtaltAvgrensningslinje":
      return "AvtaltAvgrensningslinjeMetadata";
    case "Delområdegrense":
    case "Grunnkretsgrense":
      return "StatistiskgrenseMetadata";
    case "Stemmekretsgrense":
      return "KommunalKretsgrenseMetadata";
    case "Territorialgrense":
      return "TerritorialgrenseMetadata";
    default:
      return null;
  }
};
