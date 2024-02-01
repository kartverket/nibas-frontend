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

type MetadataDiscriminator =
  | "FlateMetadata"
  | "AdministrativGrenseMetadata"
  | "RiksgrenseMetadata"
  | "TerritorialgrenseMetadata"
  | "AvtaltAvgrensningslinjeMetadata"
  | "GrunnlinjeMetadata"
  | "StatistiskgrenseMetadata"
  | "KommunalKretsgrenseMetadata";

export const getGrenseDiscriminatorFromType = (grenseType: GrenseType): MetadataDiscriminator | null => {
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
