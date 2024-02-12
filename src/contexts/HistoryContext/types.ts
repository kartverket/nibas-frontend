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
  hasPreviouslySavedHistory: boolean;
};

export type HistoryChange<T> = {
  id: string;
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
  | "grensesplitting";

type BaseHistoryEntry<HistoryType extends HistoryTypeValues, Model> = {
  type: HistoryType;
  changes: HistoryChange<Model>[];
};

export type MinimalGrense = {
  coordinates: number[][];
  type?: GrenseType | undefined;
};

export type GrenseEntry = BaseHistoryEntry<"grense", MinimalGrense>;
export type PropertyEntry = BaseHistoryEntry<"property", FeatureProperties>;
export type GrunnkretsEntry = BaseHistoryEntry<"grunnkrets", GrunnkretsRequest> & {
  kommuneId: string;
};
export type StemmekretsEntry = BaseHistoryEntry<"stemmekrets", StemmekretsRequest> & {
  kommuneId: string;
};
type UtkastEntry = BaseHistoryEntry<"utkast", UtkastRequestWithoutOperations>;

export type StemmekretsSammenslaaingsendringEntry = BaseHistoryEntry<
  "stemmekretssammenslaaingsendring",
  StemmekretsSammenslaaingsendringRequest
>;

export type GrenseArkiveringsEntry = BaseHistoryEntry<"grensearkivering", FeatureProperties>;

export type GrenseTilhorighetEntry = BaseHistoryEntry<"grensetilhorighetendring", KontekstEgenskaper[]>;

export type NyGrenseEntry = BaseHistoryEntry<"nygrense", MinimalGrense & FeatureProperties>;

export type GrenseSplittingEntry = BaseHistoryEntry<"grensesplitting", Feature[]>;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | GrunnkretsEntry
  | StemmekretsEntry
  | UtkastEntry
  | StemmekretsSammenslaaingsendringEntry
  | GrenseArkiveringsEntry
  | GrenseTilhorighetEntry
  | GrenseSplittingEntry
  | NyGrenseEntry
  | PropertyEntry;

export type HistoryContextValue = {
  addHistoryEntry: (entry: HistoryEntry) => void;
  history: HistoryState;
  clearHistory: ({ hasPreviouslySavedHistory }: { hasPreviouslySavedHistory: boolean }) => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
};

export type HistoryDirection = "from" | "to";
