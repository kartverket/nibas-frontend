export const metadataendringerKeyByConflictType: Record<string, string> = {
  GRUNNKRETS: "grunnkretsendringer",
  STEMMEKRETS: "stemmekretsendringer",
};

type Endpoint = "grunnkretser" | "stemmekretser";
export const endpointByConflictType: Record<string, Endpoint> = {
  GRUNNKRETS: "grunnkretser",
  STEMMEKRETS: "stemmekretser",
};
