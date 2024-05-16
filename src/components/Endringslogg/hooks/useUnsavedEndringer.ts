import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryChange, HistoryTypeValues, MinimalGrense } from "contexts/HistoryContext/types";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { Feature } from "ol";
import { useMemo } from "react";
import {
  FeatureProperties,
  KontekstEgenskaper,
  MetadataRequest,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";

type HistoryTypeData =
  | MinimalGrense
  | FeatureProperties
  | MetadataRequest
  | UtkastRequestWithoutOperations
  | StemmekretsSammenslaaingsendringRequest
  | KontekstEgenskaper[]
  | (MinimalGrense & FeatureProperties)
  | Feature[];

export type AbstractedHistoryEntry = {
  type: HistoryTypeValues;
  lokalid: string;
  from: HistoryTypeData;
  to: HistoryTypeData;
};

type FlatHistoryEntry = { type: HistoryTypeValues; change: HistoryChange<HistoryTypeData> };

export const useUnsavedEndringer = () => {
  const { history } = useHistory();

  // History lagrer absolutt alt, men vi er kun interessert i å vise bruker hva som er forskjellen sammenlignet med utkastet.
  // Dermed må vi finne de siste endringene for hver lokalid, og sammenligne dette med den første endringen sin "from" (utgangspunktet) for å se hva som faktisk blir endringen hvis man lagrer.
  const abstractedHistory = useMemo(() => {
    const currentHistorySlice = history.entries.slice(0, history.index);

    const firstEntriesForLokalids: Record<string, FlatHistoryEntry> = {};
    const latestEntriesForLokalids: Record<string, FlatHistoryEntry> = {};

    for (const entry of currentHistorySlice) {
      for (const change of entry.changes) {
        const key = change.id + "_" + entry.type;
        if (!(key in firstEntriesForLokalids)) {
          const flatHistoryEntry = { type: entry.type, change: change };
          firstEntriesForLokalids[key] = flatHistoryEntry;
        }
      }
    }
    for (const entry of currentHistorySlice.toReversed()) {
      for (const change of entry.changes) {
        const key = change.id + "_" + entry.type;
        if (!(key in latestEntriesForLokalids)) {
          const flatHistoryEntry = { type: entry.type, change: change };
          latestEntriesForLokalids[key] = flatHistoryEntry;
        }
      }
    }
    const abstractedChanges: AbstractedHistoryEntry[] = Object.entries(firstEntriesForLokalids).map(
      ([lokalid, entry]) => {
        const firstFrom = entry.change.from;
        const lastTo = latestEntriesForLokalids[lokalid].change.to;
        return { type: entry.type, lokalid: lokalid, from: firstFrom, to: lastTo };
      },
    );

    return abstractedChanges;
  }, [history.entries, history.index]);

  return abstractedHistory;
};
