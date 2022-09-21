import { History } from "hooks/useHistory";
import { GrunnkretsRequest, Metadata, StemmekretsRequest } from "types/api";

export type EditContextType =
  | "grense"
  | "grunnkrets"
  | "metadata"
  | "stemmekrets";

export type HistoryChange<T> = {
  id: string;
  from: T;
  to: T | null;
};

export type BaseHistoryEntry<
  Type extends EditContextType,
  Model extends unknown
> = {
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

export type KretsHistoryEntry = GrunnkretsEntry | StemmekretsEntry;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | MetadataEntry
  | GrunnkretsEntry
  | StemmekretsEntry;

export type ToolbarHistory = History<HistoryEntry>;

export type ToolbarContextValue = {
  clearHistory: () => void;
  undo: () => void;
  redo: () => void;
  history: ToolbarHistory;
  setHistory: React.Dispatch<React.SetStateAction<History<HistoryEntry>>>;
  dirtyFeatureIds: string[];
};
