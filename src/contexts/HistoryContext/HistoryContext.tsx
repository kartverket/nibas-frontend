import React, { createContext, useContext } from "react";
import { HistoryContextValue, HistoryEntry } from "./types";
import {
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
} from "./utils";
import useHistoryState from "contexts/HistoryContext/useHistoryState";
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
  const { history, addHistoryEntry, clearHistory, undo, redo } =
    useHistoryState({
      onUndo,
      onRedo,
    });

  const value = {
    history,
    clearHistory,
    undo,
    redo,
    addHistoryEntry,
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
