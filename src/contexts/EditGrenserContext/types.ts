export type EditingType = "fylke" | "kommune" | "nasjon" | "grunnkrets" | "stemmekrets";

export type KretsStatus = {
  isEditing: boolean;
  isVisible: boolean;
};

export type KretsStatusPerKretstype = Record<string, KretsStatus>;
export type KretsStatusAlle = Partial<Record<EditingType, KretsStatusPerKretstype>>;
