import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ToolbarContextValue,
  HistoryEntry,
  ToolbarPointMode,
  ToolbarEditMode,
} from "./types";
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
    case "stemmekretssammenslaaingsendring": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretssammenslaaingsendringUndo", {
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
    case "stemmekretssammenslaaingsendring": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretssammenslaaingsendringRedo", {
          detail: { entry },
        })
      );
    }
  }

  ensureAllCasesCovered(type);
};

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
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  } = useDirtyStyles();

  const historyValue = useHistory({
    onUndo,
    onRedo,
  });

  const [activeEditModes, setActiveEditModes] = useState<ToolbarEditMode[]>([
    "snap",
  ]);

  const toggleEditMode = (editMode: ToolbarEditMode) => {
    if (activeEditModes.includes(editMode)) {
      setActiveEditModes(activeEditModes.filter((em) => em !== editMode));
    } else {
      setActiveEditModes(activeEditModes.concat(editMode));
    }
  };

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
    if (historyValue.history.entries.length === 0) {
      if (
        historyValue.history.hasPreviouslySavedHistory &&
        dirtyFeatureIds.length !== 0
      ) {
        saveDirtyFeatureIds();
      }
      // Hvis det ikke er for å lagre, så er det for å forhindre uendelig løkke
      return;
    }

    const historyFeatures = historyValue.history.entries
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
      .reduce<string[][]>(getFeatureIdsFromEntries, []);

    const editFeatures = historyFeatures
      .slice(historyValue.history.index)
      .flatMap((id) => id);
    const dirtyFeatures = historyFeatures
      .slice(0, historyValue.history.index)
      .flatMap((id) => id);

    // For å forhindre uendelig løkke
    if (dirtyFeatureIds.length === dirtyFeatures.length) return;

    setEditFeatures(editFeatures);
    setDirtyFeatures(dirtyFeatures);
  }, [
    dirtyFeatureIds.length,
    historyValue.history.entries,
    historyValue.history.index,
    historyValue.history.hasPreviouslySavedHistory,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
  ]);

  const value = {
    ...historyValue,
    activePointMode,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
    dirtyFeatureIds,
    clearDirtyStyles: clearSavedDirtyFeatureIds,
    togglePointMode,
    activeEditModes,
    toggleEditMode,
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
        hasPreviouslySavedHistory: prevHistory.hasPreviouslySavedHistory,
      }));
    },
    [setHistory]
  );

  return {
    addEntry,
    history,
  };
};
