import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { GrenseType } from "hooks/layers/types";
import {
  FeatureProperties,
  GrunnkretsRequest,
  KommuneRequest,
  KontekstEgenskaper,
  KretsDelingEndringRequest,
  BopliktomraadeRequest,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";

// Obs: navnsetting for å unngå overlapp med innebygd History type
export type HistoryState = {
  index: number;
  entries: HistoryEntry[];
};

export type HistoryChange<T> = {
  id: string;
  from: T;
  to: T;
};

export const METADATA_ENTRY_TYPE_VALUES = ["grunnkrets", "stemmekrets", "bopliktomraade", "kommune"] as const;
export type MetadataTypeValues = (typeof METADATA_ENTRY_TYPE_VALUES)[number];
export type HistoryTypeValues =
  | MetadataTypeValues
  | "grense"
  | "property"
  | "utkast"
  | "stemmekretssammenslaaingsendring"
  | "kretsdelingendring"
  | "grensearkivering"
  | "grensetilhorighetendring"
  | "nygrense"
  | "grensedeling"
  | "grensedelete"
  | "merge_grenser";

export type BaseHistoryEntry<HistoryType extends HistoryTypeValues, Model> = {
  type: HistoryType;
  changes: HistoryChange<Model>[];
};

export type MinimalGrense = {
  coordinates: number[][];
  type?: GrenseType | undefined;
};

export type NyGrense = (MinimalGrense & FeatureProperties) & {
  grensedeling?: Feature<Geometry>[];
};

export type GrenseEntry = BaseHistoryEntry<"grense", MinimalGrense>;
export type PropertyEntry = BaseHistoryEntry<"property", FeatureProperties>;
export type GrunnkretsEntry = BaseHistoryEntry<"grunnkrets", GrunnkretsRequest> & {
  kommuneId: string;
};
export type StemmekretsEntry = BaseHistoryEntry<"stemmekrets", StemmekretsRequest> & {
  kommuneId: string;
};
export type BopliktomraadeEntry = BaseHistoryEntry<"bopliktomraade", BopliktomraadeRequest>;
export type KommuneEntry = BaseHistoryEntry<"kommune", KommuneRequest> & {
  fylkeId: string;
};

export type MergeGrenseModel = Feature<LineString>[];

export type MetadataEntry = KommuneEntry | StemmekretsEntry | GrunnkretsEntry | BopliktomraadeEntry;

type UtkastEntry = BaseHistoryEntry<"utkast", UtkastRequestWithoutOperations>;

export type StemmekretsSammenslaaingsendringEntry = BaseHistoryEntry<
  "stemmekretssammenslaaingsendring",
  StemmekretsSammenslaaingsendringRequest
>;

export type KretsdelingEntry = BaseHistoryEntry<"kretsdelingendring", KretsDelingEndringRequest>;

export type GrenseArkiveringsEntry = BaseHistoryEntry<"grensearkivering", FeatureProperties>;

export type GrenseTilhorighetEntry = BaseHistoryEntry<"grensetilhorighetendring", KontekstEgenskaper[]>;

export type NyGrenseEntry = BaseHistoryEntry<"nygrense", NyGrense>;

export type GrenseDelingEntry = BaseHistoryEntry<"grensedeling", Feature[]>;

export type NyGrenseDeleteEntry = BaseHistoryEntry<"grensedelete", Feature<Geometry> | null>;

export type MergeGrenseEntry = BaseHistoryEntry<"merge_grenser", MergeGrenseModel>;

// endringer skal kunne gjøres i bulk, feks et punkt på to features endrer to features i en entry
export type HistoryEntry =
  | GrenseEntry
  | MetadataEntry
  | UtkastEntry
  | StemmekretsSammenslaaingsendringEntry
  | KretsdelingEntry
  | GrenseArkiveringsEntry
  | GrenseTilhorighetEntry
  | GrenseDelingEntry
  | NyGrenseEntry
  | PropertyEntry
  | NyGrenseDeleteEntry
  | MergeGrenseEntry;

export type HistoryContextValue = {
  addHistoryEntry: (entry: HistoryEntry) => void;
  history: HistoryState;
  clearHistory: (historySaved?: boolean) => void;
  getHistoryEntries: () => HistoryEntry[];
  restoreHistoryState: (historyState: HistoryState) => void;
  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
  reapplyCurrentEntries: () => void;
};

export type HistoryDirection = "from" | "to";
