import React, { createContext, useContext } from "react";
import { HistoryContextValue, HistoryEntry } from "./types";
import {
  redoSplitting,
  undoSplitting,
  setFeatureCoordinatesAndMetadataForEntry,
  setFeatureCoordinatesForEntry,
  setFeatureMetadataForEntry,
  setKontekstEgenskaperForEntry,
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
    case "nygrense": {
      return setFeatureCoordinatesAndMetadataForEntry(entry, "from");
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
      return document.dispatchEvent(
        new CustomEvent("grensearkiveringUndo", {
          detail: { entry },
        }),
      );
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "from");
    }
    case "grensesplitting": {
      return undoSplitting(
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
    case "metadata": {
      //skal den kanskje bare gå inn under det her?
      return setFeatureMetadataForEntry(entry, "to");
    }
    case "nygrense": {
      return setFeatureCoordinatesAndMetadataForEntry(entry, "to");
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
      return document.dispatchEvent(
        new CustomEvent("grensearkiveringRedo", {
          detail: { entry },
        }),
      );
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "to");
    }
    case "grensesplitting": {
      return redoSplitting(
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
