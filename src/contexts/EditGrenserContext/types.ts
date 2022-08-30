export type EditingType =
  | "fylke"
  | "kommune"
  | "nasjon"
  | "grunnkrets"
  | "stemmekrets";
export type ObjectValue = {
  editing?: boolean;
  visible?: boolean;
};

export type GrenseDictionary = Record<string, ObjectValue>;
export type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;
