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
  INNDELINGTYPE_VALUES,
} from "types/api";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { NonExhaustiveInndelingRequest } from "pages/Kart/OverlayPanels/FlatedataPanel/FlatedataTable";

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

// Metadataentries er direkte knyttet til inndelingtype,
// ved å bruke enumen sikrer vi i sørre grad at de ikke divergerer og vi slipper konvertering mellom flere typer.
export const METADATA_ENTRY_TYPE_VALUES = INNDELINGTYPE_VALUES.filter(
  (type) => type === "GRUNNKRETS" || type === "STEMMEKRETS" || type === "BOPLIKTOMRAADE" || type === "KOMMUNE",
);
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
  | "merge_grenser"
  | "create_inndelinger";

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
export type GrunnkretsEntry = BaseHistoryEntry<"GRUNNKRETS", GrunnkretsRequest> & {
  kommuneId: string;
};
export type StemmekretsEntry = BaseHistoryEntry<"STEMMEKRETS", StemmekretsRequest> & {
  kommuneId: string;
};
export type BopliktomraadeEntry = BaseHistoryEntry<"BOPLIKTOMRAADE", BopliktomraadeRequest>;
export type KommuneEntry = BaseHistoryEntry<"KOMMUNE", KommuneRequest> & {
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

export type NyeInndelingerEntry = BaseHistoryEntry<"create_inndelinger", NonExhaustiveInndelingRequest | null>;

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
  | MergeGrenseEntry
  | NyeInndelingerEntry;

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
