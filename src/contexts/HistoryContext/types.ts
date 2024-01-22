import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { GrenseType } from "hooks/layers/types";
import {
  FeatureProperties,
  GrunnkretsRequest,
  KontekstEgenskaper,
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

type BaseHistoryEntry<Type extends string, Model> = {
  type: Type;
  changes: HistoryChange<Model>[];
};

export type MinimalGrense = {
  coordinates: number[][];
  type?: GrenseType | undefined;
};

export type GrenseEntry = BaseHistoryEntry<"grense", MinimalGrense>;
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
type UtkastEntry = BaseHistoryEntry<"utkast", UtkastRequestWithoutOperations>;

export type StemmekretsSammenslaaingsendringEntry = BaseHistoryEntry<
  "stemmekretssammenslaaingsendring",
  StemmekretsSammenslaaingsendringRequest
>;

export type GrenseArkiveringsEntry = BaseHistoryEntry<
  "grensearkivering",
  FeatureProperties
>;

export type GrenseTilhorighetEntry = BaseHistoryEntry<
  "grensetilhorighetendring",
  KontekstEgenskaper[]
>;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | MetadataEntry
  | GrunnkretsEntry
  | StemmekretsEntry
  | UtkastEntry
  | StemmekretsSammenslaaingsendringEntry
  | GrenseArkiveringsEntry
  | GrenseTilhorighetEntry;

export type HistoryContextValue = {
  addHistoryEntry: (entry: HistoryEntry) => void;
  history: HistoryState;
  clearHistory: ({
    hasPreviouslySavedHistory,
  }: {
    hasPreviouslySavedHistory: boolean;
  }) => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
};

export type HistoryDirection = "from" | "to";
