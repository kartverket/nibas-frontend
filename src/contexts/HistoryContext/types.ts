import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import {
  GrunnkretsRequest,
  Metadata,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";

// Obs: navnsetting for å unngå overlapp med innebygd History type
export type HistoryState = {
  index: number;
  entries: HistoryEntry[];
  hasPreviouslySavedHistory: boolean;
};

export type HistoryChange<T> = {
  id: string;
  from: T;
  to: T;
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

export type StemmekretsSammenslaaingsendringEntry = BaseHistoryEntry<
  "stemmekretssammenslaaingsendring",
  StemmekretsSammenslaaingsendringRequest
>;

export type KretsHistoryEntry = GrunnkretsEntry | StemmekretsEntry;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | MetadataEntry
  | GrunnkretsEntry
  | StemmekretsEntry
  | UtkastEntry
  | StemmekretsSammenslaaingsendringEntry;

export type EditContextType = HistoryEntry["type"];

export type HistoryContextValue = {
  addHistoryEntry: (entry: HistoryEntry) => void;
  undo: () => void;
  redo: () => void;
  history: HistoryState;
  clearHistory: ({
    hasPreviouslySavedHistory,
  }: {
    hasPreviouslySavedHistory: boolean;
  }) => void;
  setAndSaveUtkastFeatures: (features: string[]) => void;
  setAndSaveSammenslaaingsFeatures: (
    features: string[],
    overlappingFeatures: string[]
  ) => void;
  dirtyFeatureIds: string[];
  clearDirtyStyles: () => void;
};
