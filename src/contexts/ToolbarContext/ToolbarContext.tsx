import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ToolbarContextValue, HistoryEntry, ToolbarPointMode } from "./types";
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
    case "utkast": {
      return document.dispatchEvent(
        new CustomEvent("utkastUndo", {
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
    case "utkast": {
      return document.dispatchEvent(
        new CustomEvent("utkastRedo", {
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
  const [dirtyFeatureIds, setDirtyFeatureIds] = React.useState<string[]>([]);
  const historyValue = useHistory({
    onUndo,
    onRedo,
  });

  const [snapActive, setSnapActive] = useState(true);
  const [activePointMode, setActivePointMode] =
    useState<ToolbarPointMode>(null);
  const togglePointMode = (pointMode: ToolbarPointMode) => {
    if (pointMode === activePointMode) {
      setActivePointMode(null);
    } else {
      setActivePointMode(pointMode);
    }
  };

  useEffect(() => {
    const newValues = historyValue.history.entries
      .slice(0, historyValue.history.index)
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
      .reduce<string[]>(getDirtyIdsFromEntries, []);

    setDirtyFeatureIds((prevIds) => {
      // trenger ikke ny state hvis det ikke er noen nye verdier
      if (newValues.length === prevIds.length) {
        return prevIds;
      }

      return newValues;
    });
  }, [historyValue.history]);

  const value = {
    ...historyValue,
    dirtyFeatureIds,
    activePointMode,
    togglePointMode,
    snapActive,
    setSnapActive,
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

  const canSave = history.entries.length > 0 && history.index > 0;

  return {
    canSave,
    history,
    clearHistory,
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
