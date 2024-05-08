import { HistoryEntry, HistoryTypeValues, MinimalGrense } from "contexts/HistoryContext/types";
import { useMemo } from "react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { Feature } from "ol";
import {
  FeatureProperties,
  GrunnkretsRequest,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
  KontekstEgenskaper,
} from "types/api";

export type HistoryTypeData =
  | MinimalGrense
  | FeatureProperties
  | GrunnkretsRequest
  | StemmekretsRequest
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

export const useUnsavedEndringer = () => {
  const { history } = useHistory();

  // History lagrer absolutt alt, men vi er kun interessert i å vise bruker hva som er forskjellen sammenlignet med utkastet.
  // Dermed må vi finne de siste endringene for hver lokalid, og sammenligne dette med den første endringen sin "from" (utgangspunktet) for å se hva som faktisk blir endringen hvis man lagrer.
  const abstractedHistory = useMemo(() => {
    const currentHistorySlice = history.entries.slice(0, history.index);

    const firstEntriesForLokalids: Record<string, HistoryEntry> = {};
    const latestEntriesForLokalids: Record<string, HistoryEntry> = {};

    for (const entry of currentHistorySlice) {
      const change = entry.changes[0];
      const key = change.id + "_" + entry.type;
      if (!(key in firstEntriesForLokalids)) {
        firstEntriesForLokalids[key] = entry;
      }
    }
    for (const entry of currentHistorySlice.toReversed()) {
      const change = entry.changes[0];
      const key = change.id + "_" + entry.type;
      if (!(key in latestEntriesForLokalids)) {
        latestEntriesForLokalids[key] = entry;
      }
    }

    const minimalChanges: AbstractedHistoryEntry[] = Object.entries(firstEntriesForLokalids).map(([lokalid, entry]) => {
      const firstFrom = entry.changes[0].from;
      const lastTo = latestEntriesForLokalids[lokalid].changes[0].to;
      return { type: entry.type, lokalid: lokalid, from: firstFrom, to: lastTo };
    });

    return minimalChanges;
  }, [history.entries, history.index]);

  return abstractedHistory;
};
