export type EditingType =
  | "fylke"
  | "kommune"
  | "nasjon"
  | "grunnkrets"
  | "stemmekrets";

export type GrenseStatus = {
  editing?: boolean;
  visible?: boolean;
};

export type GrenseDictionary = Record<string, GrenseStatus>;
export type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;
