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

type HistoryTypeData =
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

export type AbstrahertHistroyEntry = {
  type: HistoryTypeValues;
  lokalid: string;
  from: HistoryTypeData;
  to: HistoryTypeData;
};

export const useUlagredeEndringer = () => {
  const { history } = useHistory();

  // History lagrer absolutt alt, men vi er kun interessert i å vise bruker hva som er forskjellen sammenlignet med utkastet.
  // Dermed må vi finne de siste endringene for hver lokalid, og sammenligne dette med den første endringen sin "from" (utgangspunktet) for å se hva som faktisk blir endringen hvis man lagrer.
  const abstrahertHistory = useMemo(() => {
    const currentHistroySlice = history.entries.slice(0, history.index);

    const firstEntriesForLokalids: Record<string, HistoryEntry> = {};
    const latestEntriesForLokalids: Record<string, HistoryEntry> = {};

    currentHistroySlice.forEach((entry) => {
      const change = entry.changes[0];
      const key = change.id + "_" + entry.type;
      if (!(key in firstEntriesForLokalids)) {
        firstEntriesForLokalids[key] = entry;
      }
    });

    currentHistroySlice
      .slice()
      .reverse()
      .forEach((entry) => {
        const change = entry.changes[0];
        const key = change.id + "_" + entry.type;
        if (!(key in latestEntriesForLokalids)) {
          latestEntriesForLokalids[key] = entry;
        }
      });

    const minimalChanges: AbstrahertHistroyEntry[] = Object.entries(firstEntriesForLokalids).map(([lokalid, entry]) => {
      const firstFrom = entry.changes[0].from;
      const lastTo = latestEntriesForLokalids[lokalid].changes[0].to;
      return { type: entry.type, lokalid: lokalid, from: firstFrom, to: lastTo };
    });

    return minimalChanges;
  }, [history.entries, history.index]);

  return abstrahertHistory;
};
