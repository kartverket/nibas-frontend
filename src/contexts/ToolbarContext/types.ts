import useHistory, { History } from "hooks/useHistory";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { FeatureProperties, GrunnkretsRequest } from "types/api";

export type EditContextType = "grense" | "grunnkrets" | "metadata";

export type BaseHistoryEntry<
  Type extends EditContextType,
  Model extends unknown
> = {
  type: Type;
  changes: {
    id: string;
    from: Model;
    to: Model | null;
  }[];
};

export type GrenseEntry = BaseHistoryEntry<"grense", number[][]>;
export type MetadataEntry = BaseHistoryEntry<"metadata", FeatureProperties>;
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
