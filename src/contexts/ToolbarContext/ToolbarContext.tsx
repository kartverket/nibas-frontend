import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ToolbarContextValue, HistoryEntry, ToolbarPointMode } from "./types";
import {
  getFeatureIdsFromEntries,
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
} from "./utils";
import useHistory from "hooks/useHistory";
import { ensureAllCasesCovered } from "utils/typeHelpers";
import useDirtyStyles from "hooks/interactions/useDirtyStyles";

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
  const {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
  } = useDirtyStyles();

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

  //punkt for hvor det legges til dirty
  useEffect(() => {
    console.log("history har endret seg, kjør logikk");
    if (historyValue.history.entries.length === 0) {
      if (historyValue.history.utkastActive && dirtyFeatureIds.length !== 0) {
        console.log("Ting skal lagres");
        saveDirtyFeatureIds();
        return;
      }
      if (historyValue.history.utkastActive && dirtyFeatureIds.length !== 0) {
        console.log("Ting skal forkastes");
        clearSavedDirtyFeatureIds();
        return;
      }
      return;
    }

    const historyFeatures = historyValue.history.entries
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
      .reduce<string[]>(getFeatureIdsFromEntries, []);

    const editFeatures = historyFeatures.slice(historyValue.history.index);
    const dirtyFeatures = historyFeatures.slice(0, historyValue.history.index);

    if (dirtyFeatureIds.length === dirtyFeatures.length) return;

    setEditFeatures(editFeatures);
    setDirtyFeatures(dirtyFeatures);

    /*
    if (newValues.length === dirtyFeatureIds.length) return;
    if (newValues.length === 0 && historyValue.history.utkastActive) return;

    let changed = false;
    for (const value of newValues) {
      if (!dirtyFeatureIds.includes(value)) {
        changed = true;
        addDirtyFeatureId(value);
      }
    }
    if (changed) return;
    //denne fjerner etter lagring
    for (const dirtyFeature of dirtyFeatureIds) {
      if (!newValues.includes(dirtyFeature)) {
        removeDirtyFeatureId(dirtyFeature);
      }
    }
    */
  }, [
    clearSavedDirtyFeatureIds,
    dirtyFeatureIds.length,
    historyValue.history.entries,
    historyValue.history.index,
    historyValue.history.utkastActive,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
  ]);

  const value = {
    ...historyValue,
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
  const { history, setHistory } = useToolbar();

  const addEntry = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prevHistory) => ({
        index: prevHistory.index + 1,
        entries: [...prevHistory.entries.slice(0, prevHistory.index), entry],
        utkastActive: prevHistory.utkastActive,
      }));
    },
    [setHistory]
  );

  const updateEntry = useCallback(
    (index: number, updatedEntry: HistoryEntry) => {
      const newHistory = {
        index: history.index,
        entries: history.entries.slice(),
        utkastActive: history.utkastActive,
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
    history,
  };
};
