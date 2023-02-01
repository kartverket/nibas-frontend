import { useState } from "react";

// dictionary med itemId som key, og ny verdi som T
export type History<T> = {
  index: number;
  entries: T[];
};

type Options<T> = {
  onUndo: (entry: T) => void;
  onRedo: (entry: T) => void;
};

const useHistory = <T>({ onUndo, onRedo }: Options<T>) => {
  const [history, setHistory] = useState<History<T>>({
    index: 0,
    entries: [],
  });

  const [utkastHistory, setUtkastHistory] = useState<History<T>>({
    index: 0,
    entries: [],
  });

  // useEffect(() => {
  //   // Når history endrer seg, så legg til nye entrys i den, så slipper man å endre på det
  //   //må det tas hensyn til at

  // })[history];

  const clearHistory = () => {
    setHistory({
      entries: [],
      index: 0,
    });
  };

  //Skal bare skje når man går ut av utkastet
  const clearUtkastHistory = () => {
    setUtkastHistory({
      entries: [],
      index: 0,
    });
  };

  //når man skal sette når et utkast åpnes igjen, kan man bare sette det med setUtkastHistory

  const revert = (amount: number) => {
    const { index, entries } = history;

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
    });

    setUtkastHistory({
      entries,
      index: newIndex,
    });
  };

  const reapply = (amount: number) => {
    const { index, entries } = history;

    if (index >= entries.length) return;

    const newIndex =
      index + amount > entries.length ? entries.length : index + amount;

    for (let i = index; i < newIndex; i++) {
      onRedo(history.entries[i]);
    }

    setHistory({
      entries,
      index: newIndex,
    });

    setUtkastHistory({
      entries,
      index: newIndex,
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
    utkastHistory,
    setUtkastHistory,
    clearUtkastHistory,
  };
};

export default useHistory;
