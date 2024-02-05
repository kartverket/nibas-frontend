import { useCallback, useState } from "react";
import { HistoryState, HistoryEntry } from "./types";

type Options = {
  onUndo: (entry: HistoryEntry) => void;
  onRedo: (entry: HistoryEntry) => void;
};

const useHistoryState = ({ onUndo, onRedo }: Options) => {
  const [history, setHistory] = useState<HistoryState>({
    index: 0,
    entries: [],
    hasPreviouslySavedHistory: false,
  });

  const addHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prevHistory) => ({
        index: prevHistory.index + 1,
        entries: [...prevHistory.entries.slice(0, prevHistory.index), entry],
        hasPreviouslySavedHistory: prevHistory.hasPreviouslySavedHistory,
      }));
    },
    [setHistory],
  );

  const clearHistory = ({ hasPreviouslySavedHistory }: { hasPreviouslySavedHistory: boolean }) => {
    setHistory({
      entries: [],
      index: 0,
      hasPreviouslySavedHistory: hasPreviouslySavedHistory,
    });
  };

  const revert = (amount: number) => {
    const { index, entries, hasPreviouslySavedHistory } = history;

    if (index === 0 || entries.length === 0) return;

    const newIndex = index - (amount > index ? index : amount);

    // gå bakover til nye indexen og sett koordinater for alle features
    // frem til nye index
    for (let i = newIndex; i > newIndex - 1; i--) {
      onUndo(history.entries[i]);
    }

    setHistory({
      entries,
      index: newIndex,
      hasPreviouslySavedHistory,
    });
  };

  const reapply = (amount: number) => {
    const { index, entries, hasPreviouslySavedHistory } = history;

    if (index >= entries.length) return;

    const newIndex = index + amount > entries.length ? entries.length : index + amount;

    for (let i = index; i < newIndex; i++) {
      onRedo(history.entries[i]);
    }

    setHistory({
      entries,
      index: newIndex,
      hasPreviouslySavedHistory,
    });
  };

  const undo = () => {
    revert(1);
  };

  const redo = () => {
    reapply(1);
  };

  return {
    history,
    addHistoryEntry,
    clearHistory,
    undo,
    redo,
  };
};

export default useHistoryState;
