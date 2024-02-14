import React, { createContext, useContext } from "react";
import { HistoryContextValue, HistoryEntry } from "./types";
import {
  setFeatureCoordinatesAndPropertiesForEntry,
  setFeatureCoordinatesForEntry,
  setKontekstEgenskaperForEntry,
  setFeaturePropertiesForEntry,
  redoArchiving,
  undoArchving,
  undoGrenseDeling,
  redoGrenseDeling,
} from "./utils";
import useHistoryState from "contexts/HistoryContext/useHistoryState";
import { ensureAllCasesCovered } from "utils/typeHelpers";

const onUndo = (entry: HistoryEntry) => {
  const { type } = entry;

  switch (type) {
    case "grense": {
      return setFeatureCoordinatesForEntry(entry, "from");
    }
    case "property": {
      return setFeaturePropertiesForEntry(entry, "from");
    }
    case "nygrense": {
      return setFeatureCoordinatesAndPropertiesForEntry(entry, "from");
    }
    case "grunnkrets": {
      return document.dispatchEvent(
        new CustomEvent("grunnkretsUndo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekrets": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretsUndo", {
          detail: { entry },
        }),
      );
    }
    case "utkast": {
      return document.dispatchEvent(
        new CustomEvent("utkastUndo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekretssammenslaaingsendring": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretssammenslaaingsendringUndo", {
          detail: { entry },
        }),
      );
    }
    case "grensearkivering": {
      return undoArchving(entry);
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "from");
    }
    case "grensedeling": {
      return undoGrenseDeling(
        entry.changes.flatMap((e) => e.from)[0],
        entry.changes.flatMap((e) => e.to),
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
    case "property": {
      return setFeaturePropertiesForEntry(entry, "to");
    }
    case "nygrense": {
      return setFeatureCoordinatesAndPropertiesForEntry(entry, "to");
    }
    case "grunnkrets": {
      return document.dispatchEvent(
        new CustomEvent("grunnkretsRedo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekrets": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretsRedo", {
          detail: { entry },
        }),
      );
    }
    case "utkast": {
      return document.dispatchEvent(
        new CustomEvent("utkastRedo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekretssammenslaaingsendring": {
      return document.dispatchEvent(
        new CustomEvent("stemmekretssammenslaaingsendringRedo", {
          detail: { entry },
        }),
      );
    }
    case "grensearkivering": {
      return redoArchiving(entry);
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "to");
    }
    case "grensedeling": {
      return redoGrenseDeling(
        entry.changes.flatMap((e) => e.from)[0],
        entry.changes.flatMap((e) => e.to),
      );
    }
  }
  ensureAllCasesCovered(type);
};

export const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { history, addHistoryEntry, clearHistory, undo, redo } = useHistoryState({
    onUndo,
    onRedo,
  });

  const value = {
    history,
    clearHistory,
    canSave: history.entries.length > 0 && history.index > 0,
    undo: history.index > 0 ? undo : undefined,
    redo: history.entries.length > 0 && history.index < history.entries.length ? redo : undefined,
    addHistoryEntry,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const context = useContext(HistoryContext);

  if (!context) {
    throw new Error("useHistory must be used within a HistoryContext");
  }

  return context;
};
