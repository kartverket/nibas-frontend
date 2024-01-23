export type EditingType =
  | "fylke"
  | "kommune"
  | "nasjon"
  | "grunnkrets"
  | "stemmekrets";

export type KretsStatus = {
  editing?: boolean;
  visible?: boolean;
};

export type KretsStatusPerKretstype = Record<string, KretsStatus>;
export type KretsStatusAlle = Partial<
  Record<EditingType, KretsStatusPerKretstype>
>;
