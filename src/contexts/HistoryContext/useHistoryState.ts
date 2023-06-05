import { useState } from "react";

// dictionary med itemId som key, og ny verdi som T
export type History<T> = {
  index: number;
  entries: T[];
  hasPreviouslySavedHistory: boolean;
};

type Options<T> = {
  onUndo: (entry: T) => void;
  onRedo: (entry: T) => void;
};

const useHistoryState = <T>({ onUndo, onRedo }: Options<T>) => {
  const [history, setHistory] = useState<History<T>>({
    index: 0,
    entries: [],
    hasPreviouslySavedHistory: false,
  });

  const clearHistory = ({
    hasPreviouslySavedHistory,
  }: {
    hasPreviouslySavedHistory: boolean;
  }) => {
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

    const newIndex =
      index + amount > entries.length ? entries.length : index + amount;

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
    setHistory,
    clearHistory,
    undo,
    redo,
  };
};

export default useHistoryState;
