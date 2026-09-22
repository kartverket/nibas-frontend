import useHistoryState from "contexts/HistoryContext/useHistoryState";
import React, { createContext, useContext } from "react";
import {
  handleArchiveInndeling,
  handleGrensedeling,
  handleGrenseMerge,
  handleNyGrense,
  redoArchiving,
  redoDelete,
  setFeatureCoordinatesForEntry,
  setFeaturePropertiesForEntry,
  setKontekstEgenskaperForEntry,
  setRepresentasjonspunktForMetadataEntry,
  undoArchiving,
  undoDelete,
} from "./history-utils";
import { HistoryContextValue, HistoryEntry } from "./types";
import { dispatchHistoryEvent } from "./history-events";

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
    case "GRUNNKRETS": {
      setRepresentasjonspunktForMetadataEntry(entry, "from");
      return dispatchHistoryEvent("grunnkretsUndo", { entry });
    }
    case "STEMMEKRETS": {
      setRepresentasjonspunktForMetadataEntry(entry, "from");
      return dispatchHistoryEvent("stemmekretsUndo", { entry });
    }
    case "BOPLIKTOMRAADE": {
      setRepresentasjonspunktForMetadataEntry(entry, "from");
      return dispatchHistoryEvent("bopliktomraadeUndo", { entry });
    }
    case "KOMMUNE": {
      return dispatchHistoryEvent("kommuneUndo", { entry });
    }
    case "utkast": {
      return;
    }
    case "stemmekretssammenslaaingsendring": {
      return;
    }
    case "grensearkivering": {
      return undoArchiving(entry);
    }
    case "grensedelete": {
      return undoDelete(entry);
    }
    case "kretsdelingendring": {
      return;
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "from");
    }
    case "grensedeling": {
      return handleGrensedeling(entry, "from");
    }
    case "merge_grenser": {
      return handleGrenseMerge(entry, "from");
    }
    case "create_inndelinger": {
      return;
    }
    case "archive_inndeling": {
      return handleArchiveInndeling(entry, "from");
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
    case "GRUNNKRETS": {
      setRepresentasjonspunktForMetadataEntry(entry, "to");
      return dispatchHistoryEvent("grunnkretsRedo", { entry });
    }
    case "STEMMEKRETS": {
      setRepresentasjonspunktForMetadataEntry(entry, "to");
      return dispatchHistoryEvent("stemmekretsRedo", { entry });
    }
    case "BOPLIKTOMRAADE": {
      setRepresentasjonspunktForMetadataEntry(entry, "to");
      return dispatchHistoryEvent("bopliktomraadeRedo", { entry });
    }
    case "KOMMUNE": {
      return dispatchHistoryEvent("kommuneRedo", { entry });
    }
    case "utkast": {
      return;
    }
    case "stemmekretssammenslaaingsendring": {
      return;
    }
    case "kretsdelingendring": {
      return;
    }
    case "grensearkivering": {
      return redoArchiving(entry);
    }
    case "grensedelete": {
      return redoDelete(entry);
    }
    case "grensetilhorighetendring": {
      return setKontekstEgenskaperForEntry(entry, "to");
    }
    case "grensedeling": {
      return handleGrensedeling(entry, "to");
    }
    case "merge_grenser": {
      return handleGrenseMerge(entry, "to");
    }
    case "create_inndelinger": {
      return;
    }
    case "archive_inndeling": {
      return handleArchiveInndeling(entry, "to");
    }
  }
};

export const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

type HistoryProviderProps = {
  children: React.ReactNode;
  initialHistory?: HistoryEntry[];
};
export const HistoryProvider = ({ children, initialHistory }: HistoryProviderProps) => {
  const { history, addHistoryEntry, clearHistory, undo, redo, restoreHistoryState } = useHistoryState({
    onUndo,
    onRedo,
    initialState: initialHistory,
  });

  const getHistoryEntries = () => history.entries.slice(0, history.index);

  const reapplyCurrentEntries = () => {
    for (const entry of getHistoryEntries()) {
      onRedo(entry);
    }
  };

  const value = {
    restoreHistoryState,
    history,
    clearHistory,
    getHistoryEntries,
    canSave: history.entries.length > 0 && history.index > 0,
    undo: history.index > 0 ? undo : undefined,
    redo: history.entries.length > 0 && history.index < history.entries.length ? redo : undefined,
    addHistoryEntry,
    reapplyCurrentEntries,
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
