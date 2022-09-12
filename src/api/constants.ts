import { EditingType } from "contexts/EditGrenserContext";

export const endpointByEditingType: Record<EditingType, string> = {
  fylke: "fylker",
  grunnkrets: "grunnkretser",
  kommune: "kommuner",
  nasjon: "nasjoner",
  stemmekrets: "stemmekretser",
};
