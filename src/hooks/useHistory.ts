import { useState } from "react";

// dictionary med itemId som key, og ny verdi som T
export type History<T> = {
  index: number;
  entries: T[];
  utkastActive: boolean;
};

type Options<T> = {
  onUndo: (entry: T) => void;
  onRedo: (entry: T) => void;
};

const useHistory = <T>({ onUndo, onRedo }: Options<T>) => {
  const [history, setHistory] = useState<History<T>>({
    index: 0,
    entries: [],
    utkastActive: false,
  });

  const clearHistory = (isUtkastActive: boolean) => {
    setHistory({
      entries: [],
      index: 0,
      utkastActive: isUtkastActive,
    });
  };

  const revert = (amount: number) => {
    const { index, entries, utkastActive } = history;

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
      utkastActive,
    });
  };

  const reapply = (amount: number) => {
    const { index, entries, utkastActive } = history;

    if (index >= entries.length) return;

    const newIndex =
      index + amount > entries.length ? entries.length : index + amount;

    for (let i = index; i < newIndex; i++) {
      onRedo(history.entries[i]);
    }

    setHistory({
      entries,
      index: newIndex,
      utkastActive,
    });
  };

  const undo = () => {
    revert(1);
  };

  const redo = () => {
    reapply(1);
  };

  return {
    clearHistory,
    undo,
    redo,
    history,
    setHistory,
  };
};

export default useHistory;
