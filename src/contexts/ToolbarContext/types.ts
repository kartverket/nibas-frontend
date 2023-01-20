import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { History } from "hooks/useHistory";
import { GrunnkretsRequest, Metadata, StemmekretsRequest } from "types/api";

export type HistoryChange<T> = {
  id: string;
  from: T;
  to: T | null;
};

export type BaseHistoryEntry<Type extends string, Model> = {
  type: Type;
  changes: HistoryChange<Model>[];
};

export type GrenseEntry = BaseHistoryEntry<"grense", number[][]>;
export type MetadataEntry = BaseHistoryEntry<"metadata", Metadata>;
export type GrunnkretsEntry = BaseHistoryEntry<
  "grunnkrets",
  GrunnkretsRequest
> & {
  kommuneId: string;
};
export type StemmekretsEntry = BaseHistoryEntry<
  "stemmekrets",
  StemmekretsRequest
> & {
  kommuneId: string;
};
export type UtkastEntry = BaseHistoryEntry<
  "utkast",
  UtkastRequestWithoutOperations
>;

export type KretsHistoryEntry = GrunnkretsEntry | StemmekretsEntry;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | MetadataEntry
  | GrunnkretsEntry
  | StemmekretsEntry
  | UtkastEntry;

export type EditContextType = HistoryEntry["type"];

export type ToolbarHistory = History<HistoryEntry>;

export type ToolbarPointMode = null | "add" | "remove";

export type ToolbarContextValue = {
  clearHistory: () => void;
  undo: () => void;
  redo: () => void;
  history: ToolbarHistory;
  setHistory: React.Dispatch<React.SetStateAction<History<HistoryEntry>>>;
  dirtyFeatureIds: string[];
  activePointMode: ToolbarPointMode;
  togglePointMode: (pointMode: ToolbarPointMode) => void;
  snapActive: boolean;
  setSnapActive: (snapActive: boolean) => void;
};
