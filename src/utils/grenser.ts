import { GrenseType } from "hooks/layers/types";
import { MetadataDiscriminator } from "types/api";

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

export const isBopliktGrense = (grenseType: GrenseType): boolean => grenseType === "Bopliktgrense";

export const isKommuneGrense = (grenseType: GrenseType): boolean => grenseType === "Kommunegrense";

export const isFylkesGrense = (grenseType: GrenseType): boolean => grenseType === "Fylkesgrense";

export const getMetadataDiscriminatorFromType = (grenseType: GrenseType): MetadataDiscriminator => {
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
    case "Bopliktgrense":
      return "KommunalKretsgrenseMetadata";
    case "Territorialgrense":
      return "TerritorialgrenseMetadata";
    case "Posisjon": {
      throw new Error('Not implemented yet: "Posisjon" case');
    }
    case "GRUNNKRETS": {
      throw new Error('Not implemented yet: "GRUNNKRETS" case');
    }
    case "STEMMEKRETS": {
      throw new Error('Not implemented yet: "STEMMEKRETS" case');
    }
    case "BOPLIKTOMRAADE": {
      throw new Error('Not implemented yet: "BOPLIKTOMRAADE" case');
    }
  }
};
