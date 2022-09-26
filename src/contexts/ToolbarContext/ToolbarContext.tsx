import React, { createContext, useCallback, useContext, useMemo } from "react";
import { ToolbarContextValue, HistoryEntry } from "./types";
import useSaveHandlers from "./useSaveHandlers";
import {
  getDirtyIdsFromEntries,
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
} from "./utils";
import useHistory from "hooks/useHistory";
import { ensureAllCasesCovered } from "utils/typeHelpers";

const onUndo = (entry: HistoryEntry) => {
  const { type } = entry;

  switch (type) {
    case "grense": {
      return setFeatureCoordinatesForEntry(entry, "from");
    }
    case "metadata": {
      return setFeatureMetadataForEntry(entry, "from");
    }
    case "grunnkrets": {
      return document.dispatchEvent(
        new CustomEvent("grunnkretsUndo", {
          detail: { entry },
        })
      );
    }
    case "stemmekrets": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretsUndo", {
          detail: { entry },
        })
      );
    }
  }

  ensureAllCasesCovered(type);
};

const onRedo = (entry: HistoryEntry) => {
  const { type } = entry;

  switch (type) {
    case "grense": {
      return setFeatureCoordinatesForEntry(entry, "to");
    }
    case "metadata": {
      return setFeatureMetadataForEntry(entry, "to");
    }
    case "grunnkrets": {
      return document.dispatchEvent(
        new CustomEvent("grunnkretsRedo", {
          detail: { entry },
        })
      );
    }
    case "stemmekrets": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretsRedo", {
          detail: { entry },
        })
      );
    }
  }

  ensureAllCasesCovered(type);
};

/**
 * @deprecated Ikke bruk utenfor ToolbarContext.tsx, bruk heller useToolbar eller useToolbarSaving
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
        .reduce<string[]>(getDirtyIdsFromEntries, []),
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

  return context;
};

export const useToolbarActions = () => {
  const { clearHistory, history, redo, undo } = useToolbar();

  const { saveGrunnkretser, saveGrenserAndMetadata, saveStemmekretser } =
    useSaveHandlers(history);

  const canSave = history.entries.length > 0 && history.index > 0;

  const save = async () => {
    const savePromises = history.entries.map(async (entry) => {
      const { type } = entry;

      switch (type) {
        case "metadata":
        case "grense": {
          return saveGrenserAndMetadata();
        }
        case "grunnkrets": {
          return saveGrunnkretser();
        }
        case "stemmekrets": {
          return saveStemmekretser();
        }
      }

      ensureAllCasesCovered(type);
    });

    await Promise.all(savePromises);

    clearHistory();
  };

  return {
    canSave,
    history,
    clearHistory,
    save,
    undo: history.index > 0 ? undo : undefined,
    redo:
      history.entries.length > 0 && history.index < history.entries.length
        ? redo
        : undefined,
  };
};

export const useToolbarSaving = () => {
  const { history, setHistory, dirtyFeatureIds } = useToolbar();

  const addEntry = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prevHistory) => ({
        index: prevHistory.index + 1,
        entries: [...prevHistory.entries.slice(0, prevHistory.index), entry],
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
