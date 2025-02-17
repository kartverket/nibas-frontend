import { useCallback, useState } from "react";
import { HistoryState, HistoryEntry } from "./types";
import { getChangeIds } from "./history-utils";
import { removeFeatureFromAllLayers } from "utils/features";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";

type Options = {
  onUndo: (entry: HistoryEntry) => void;
  onRedo: (entry: HistoryEntry) => void;
  initialState?: HistoryEntry[];
};

const useHistoryState = ({ onUndo, onRedo, initialState = [] }: Options) => {
  const [history, setHistory] = useState<HistoryState>({
    index: initialState?.length ?? 0,
    entries: initialState,
  });

  const { updateFeatureStyles, saveFeatureStyles } = useFeatureStyle();

  // Dersom applikasjonen er i tilstanden endring -> angre -> endring, kan man ende opp med features i en source
  // som ikke er representert i hverken history eller database. Dette vil lage "usynlig" geometri som skaper bugs i beregninger.
  const clearFeaturesAfterIndex = useCallback(() => {
    if (history.entries.length === 0) {
      return;
    }

    const entriesBeforeIndex = history.entries.slice(0, history.index);
    const entriesAfterIndex = history.entries.slice(history.index);
    const changedFeatureIdsAfterIndex: string[] = entriesAfterIndex.flatMap(getChangeIds);
    const changedFeatureIdsBeforeIndex: string[] = entriesBeforeIndex.flatMap(getChangeIds);

    const featureIdsToRemove = changedFeatureIdsAfterIndex?.filter(
      (futuresHistoryId) =>
        isTempFeatureId(futuresHistoryId) &&
        !changedFeatureIdsBeforeIndex.some((pastHistoryId) => pastHistoryId === futuresHistoryId),
    );

    featureIdsToRemove.forEach(removeFeatureFromAllLayers);
  }, [history]);

  const addHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      clearFeaturesAfterIndex();
      // Bruker funksjonell oppdatering, der vi mottar `prevHistory` i en callback, i stedet for å bruke `history` direkte.
      // For å unngå concurrency-feil hvis man kaller addHistoryEntry flere ganger etter hverandre. (f.eks når man tegner ny grense og splitter automatisk)
      setHistory((prevHistory) => {
        const newEntries = [...prevHistory.entries.slice(0, prevHistory.index), entry];
        updateFeatureStyles(newEntries);
        return {
          index: prevHistory.index + 1,
          entries: newEntries,
        };
      });
    },
    [clearFeaturesAfterIndex, updateFeatureStyles],
  );

  const clearHistory = (historySaved: boolean = false) => {
    if (historySaved) {
      saveFeatureStyles();
    }
    setHistory({ index: 0, entries: [] });
    updateFeatureStyles([]);
  };

  const restoreHistoryState = useCallback(
    (historyState: HistoryState) => {
      for (let i = 0; i < historyState.index; i++) {
        onRedo(historyState.entries[i]);
      }
      setHistory(historyState);
      updateFeatureStyles(historyState.entries);
    },
    [onRedo, updateFeatureStyles],
  );

  const revert = (amount: number) => {
    const { index, entries } = history;

    if (index === 0 || entries.length === 0) {
      return;
    }

    const newIndex = index - (amount > index ? index : amount);

    // gå bakover til nye indexen og sett koordinater for alle features
    // frem til nye index
    for (let i = newIndex; i > newIndex - 1; i--) {
      onUndo(history.entries[i]);
    }

    updateFeatureStyles(entries.slice(0, newIndex));
    setHistory({ index: newIndex, entries });
  };

  const reapply = (amount: number) => {
    const { index, entries } = history;

    if (index >= entries.length) {
      return;
    }

    const newIndex = index + amount > entries.length ? entries.length : index + amount;

    for (let i = index; i < newIndex; i++) {
      onRedo(history.entries[i]);
    }

    updateFeatureStyles(entries.slice(0, newIndex));
    setHistory({ index: newIndex, entries });
  };

  const undo = () => {
    revert(1);
  };

  const redo = () => {
    reapply(1);
  };

  return {
    history,
    restoreHistoryState,
    addHistoryEntry,
    clearHistory,
    undo,
    redo,
    reapply,
  };
};

export default useHistoryState;
