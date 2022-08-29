import useHistory, { History } from "hooks/useHistory";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { EditContextType, ToolbarContextValue, HistoryEntry } from "./types";
import useSaveHandlers from "./useSaveHandlers";
import {
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
} from "./utils";

const onUndo = (entry: HistoryEntry) => {
  switch (entry.type) {
    case "grense": {
      return setFeatureCoordinatesForEntry(entry, "from");
    }
    case "metadata": {
      return setFeatureMetadataForEntry(entry, "from");
    }
  }
};

const onRedo = (entry: HistoryEntry) => {
  switch (entry.type) {
    case "grense": {
      return setFeatureCoordinatesForEntry(entry, "to");
    }
    case "metadata": {
      return setFeatureMetadataForEntry(entry, "to");
    }
  }
};

/**
 * @deprecated Ikke bruk utenfor ToolbarContext.tsx, bruk heller useToolbar eller useToolbarSave
 */
export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined
);

export const ToolbarProvider: React.FC = ({ children }) => {
  const historyValue = useHistory({
    onUndo,
    onRedo,
  });

  const dirtyFeatureIds = useMemo(
    () =>
      historyValue.history.entries
        .slice(0, historyValue.history.index)
        .filter((entry) => entry.type === "grense" || entry.type === "metadata")
        .reduce<string[]>((accumulator, entry) => {
          entry.changes.forEach((change) => {
            if (change.to && !accumulator.includes(change.id)) {
              accumulator.push(change.id);
            }
          });

          return accumulator;
        }, []),
    [historyValue.history]
  );

  const value = {
    ...historyValue,
    dirtyFeatureIds,
  };

  return (
    <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
  );
};

export const useToolbar = () => {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarContext");
  }

  const { clearHistory, history, redo, setHistory, undo } = context;

  const { saveGrunnkretser, saveGrenserAndMetadata } = useSaveHandlers(history);

  const canSave = history.entries.length > 0 && history.index > 0;

  useEffect(() => {
    console.log(history);
  }, [history]);

  const save = async () => {
    const savePromises = history.entries.map(async (entry) => {
      const type = entry.type;

      switch (type) {
        case "metadata":
        case "grense": {
          return saveGrenserAndMetadata();
        }
        case "grunnkrets": {
          return saveGrunnkretser();
        }
      }

      // sikre at vi har håndtert alle cases i switch
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = type;
    });

    await Promise.all(savePromises);

    clearHistory();
  };

  return {
    canSave,
    save,
    undo: history.index > 0 ? undo : undefined,
    redo:
      history.entries.length > 0 && history.index < history.entries.length
        ? redo
        : undefined,
  };
};

export const useToolbarSave = <T extends EditContextType>(contextType: T) => {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbarSave must be used within a ToolbarContext");
  }

  const { history, setHistory, dirtyFeatureIds } = context;

  const addEntry = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prevHistory) => ({
        index: prevHistory.index + 1,
        entries: [...prevHistory.entries, entry],
      }));
    },
    [setHistory]
  );

  const updateEntry = useCallback(
    (index: number, updatedEntry: HistoryEntry) => {
      const newHistory = {
        index: history.index,
        entries: history.entries.slice(),
      };

      newHistory.entries[index] = updatedEntry;

      setHistory(newHistory);
    },
    [history, setHistory]
  );

  const updateLatestEntry = useCallback(
    (updatedEntry: HistoryEntry) =>
      updateEntry(history.index - 1, updatedEntry),
    [history, updateEntry]
  );

  return {
    addEntry,
    updateEntry,
    updateLatestEntry,
    dirtyFeatureIds,
    history,
  };
};

// lang scroll på vindu i stor skjerm
