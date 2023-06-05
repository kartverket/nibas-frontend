import React, { createContext, useContext, useEffect, useState } from "react";
import {
  HistoryContextValue,
  HistoryEntry,
  ToolbarPointMode,
  ToolbarEditMode,
} from "./types";
import {
  getFeatureIdsFromEntries,
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
} from "./utils";
import useHistoryState from "contexts/HistoryContext/useHistoryState";
import { ensureAllCasesCovered } from "utils/typeHelpers";
import useDirtyStyles from "contexts/HistoryContext/useDirtyStyles";

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

export const HistoryContext = createContext<HistoryContextValue | undefined>(
  undefined
);

export const HistoryProvider: React.FC = ({ children }) => {
  const {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  } = useDirtyStyles();

  const { history, addHistoryEntry, clearHistory, undo, redo } =
    useHistoryState({
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
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory && dirtyFeatureIds.length !== 0) {
        saveDirtyFeatureIds();
      }
      // Hvis det ikke er for å lagre, så er det for å forhindre uendelig løkke
      return;
    }

    const historyFeatures = history.entries
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
      .reduce<string[][]>(getFeatureIdsFromEntries, []);

    const editFeatures = historyFeatures
      .slice(history.index)
      .flatMap((id) => id);
    const dirtyFeatures = historyFeatures
      .slice(0, history.index)
      .flatMap((id) => id);

    // For å forhindre uendelig løkke
    if (dirtyFeatureIds.length === dirtyFeatures.length) return;

    setEditFeatures(editFeatures);
    setDirtyFeatures(dirtyFeatures);
  }, [
    dirtyFeatureIds.length,
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
  ]);

  const value = {
    history,
    clearHistory,
    undo,
    redo,
    addHistoryEntry,
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
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);

  if (!context) {
    throw new Error("useHistory must be used within a HistoryContext");
  }

  return context;
};

export const useToolbarActions = () => {
  const { clearHistory, history, redo, undo } = useHistory();

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
