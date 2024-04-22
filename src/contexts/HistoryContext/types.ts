import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { GrenseType } from "hooks/layers/types";
import {
  FeatureProperties,
  GrunnkretsRequest,
  KontekstEgenskaper,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { Feature } from "ol";

// Obs: navnsetting for å unngå overlapp med innebygd History type
export type HistoryState = {
  index: number;
  entries: HistoryEntry[];
};

export type HistoryChange<T> = {
  id: string;
  type: HistoryTypeValues;
  from: T;
  to: T;
};
export type HistoryTypeValues =
  | "grense"
  | "property"
  | "grunnkrets"
  | "stemmekrets"
  | "utkast"
  | "stemmekretssammenslaaingsendring"
  | "grensearkivering"
  | "grensetilhorighetendring"
  | "nygrense"
  | "grensedeling";

export type BaseHistoryEntry<HistoryType extends HistoryTypeValues> = {
  type: HistoryType;
  changes: HistoryChange<HistoryChangeEntry>[];
};

export type MinimalGrense = {
  coordinates: number[][];
  type?: GrenseType | undefined;
};

export type HistoryChangeEntry =
  | MinimalGrense
  | FeatureProperties
  | GrunnkretsRequest
  | StemmekretsRequest
  | UtkastRequestWithoutOperations
  | StemmekretsSammenslaaingsendringRequest
  | FeatureProperties
  | KontekstEgenskaper[]
  | (MinimalGrense & FeatureProperties)
  | Feature[];

export type GrenseEntry = BaseHistoryEntry<"grense">;
export type PropertyEntry = BaseHistoryEntry<"property">;
export type GrunnkretsEntry = BaseHistoryEntry<"grunnkrets"> & {
  kommuneId: string;
};
export type StemmekretsEntry = BaseHistoryEntry<"stemmekrets"> & {
  kommuneId: string;
};
type UtkastEntry = BaseHistoryEntry<"utkast">;

export type StemmekretsSammenslaaingsendringEntry = BaseHistoryEntry<"stemmekretssammenslaaingsendring">;

export type GrenseArkiveringsEntry = BaseHistoryEntry<"grensearkivering">;

export type GrenseTilhorighetEntry = BaseHistoryEntry<"grensetilhorighetendring">;

export type NyGrenseEntry = BaseHistoryEntry<"nygrense">;

export type GrenseDelingEntry = BaseHistoryEntry<"grensedeling">;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | GrunnkretsEntry
  | StemmekretsEntry
  | UtkastEntry
  | StemmekretsSammenslaaingsendringEntry
  | GrenseArkiveringsEntry
  | GrenseTilhorighetEntry
  | GrenseDelingEntry
  | NyGrenseEntry
  | PropertyEntry;

export type HistoryContextValue = {
  addHistoryEntry: (entry: HistoryEntry) => void;
  history: HistoryState;
  clearHistory: () => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
};

export type HistoryDirection = "from" | "to";
