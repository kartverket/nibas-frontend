import { EditingType } from "contexts/EditGrenserContext";
import useHistory, { History } from "hooks/useHistory";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { FeatureProperties, GrunnkretsRequest, Metadata } from "types/api";

export type EditContextType = "grense" | "grunnkrets" | "metadata";

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

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry = GrenseEntry | MetadataEntry | GrunnkretsEntry;

export type ToolbarContextValue = {
  clearHistory: () => void;
  undo: () => void;
  redo: () => void;
  history: History<HistoryEntry>;
  setHistory: React.Dispatch<React.SetStateAction<History<HistoryEntry>>>;
  dirtyFeatureIds: string[];
};
