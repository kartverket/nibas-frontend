import React, { createContext, useContext } from "react";
import { HistoryContextValue, HistoryEntry } from "./types";
import {
  setFeatureCoordinatesForEntry,
  setKontekstEgenskaperForEntry,
  setFeaturePropertiesForEntry,
  redoArchiving,
  undoArchving,
  handleGrensedeling,
  handleNyGrense,
  setRepresentasjonspunktForEntry,
} from "./history-utils";
import useHistoryState from "contexts/HistoryContext/useHistoryState";

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
      return handleNyGrense(entry, "from");
    }
    case "grunnkrets": {
      setRepresentasjonspunktForEntry(entry, "from");
      return document.dispatchEvent(
        new CustomEvent("grunnkretsUndo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekrets": {
      setRepresentasjonspunktForEntry(entry, "from");
      return document.dispatchEvent(
        new CustomEvent("stemmekretsUndo", {
          detail: { entry },
        }),
      );
    }
    case "kommune": {
      return document.dispatchEvent(
        new CustomEvent("kommuneUndo", {
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
    case "kretsdelingendring": {
      return document.dispatchEvent(
        new CustomEvent("kretsdelingUndo", {
          detail: { entry },
        }),
      );
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "from");
    }
    case "grensedeling": {
      return handleGrensedeling(entry, "from");
    }
  }
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
      return handleNyGrense(entry, "to");
    }
    case "grunnkrets": {
      setRepresentasjonspunktForEntry(entry, "to");
      return document.dispatchEvent(
        new CustomEvent("grunnkretsRedo", {
          detail: { entry },
        }),
      );
    }
    case "stemmekrets": {
      setRepresentasjonspunktForEntry(entry, "to");
      return document.dispatchEvent(
        new CustomEvent("stemmekretsRedo", {
          detail: { entry },
        }),
      );
    }
    case "kommune": {
      return document.dispatchEvent(
        new CustomEvent("kommuneRedo", {
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
    case "kretsdelingendring": {
      return document.dispatchEvent(
        new CustomEvent("kretsdelingRedo", {
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
      return handleGrensedeling(entry, "to");
    }
  }
};

export const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

type HistoryProviderProps = {
  children: React.ReactNode;
  initialHistory?: HistoryEntry[];
};
export const HistoryProvider = ({ children, initialHistory }: HistoryProviderProps) => {
  const { history, addHistoryEntry, clearHistory, undo, redo } = useHistoryState({
    onUndo,
    onRedo,
    initialState: initialHistory,
  });

  const getHistoryEntries = () => history.entries.slice(0, history.index);

  const value = {
    history,
    clearHistory,
    getHistoryEntries,
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
