import React, { createContext, useContext } from "react";
import { useHistory } from "./HistoryContext";

export type ToolbarContextValue = {
  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
};

export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined
);

export const ToolbarProvider: React.FC = ({ children }) => {
  const { history, redo, undo } = useHistory();

  const canSave = history.entries.length > 0 && history.index > 0;

  const value = {
    canSave,
    undo: history.index > 0 ? undo : undefined,
    redo:
      history.entries.length > 0 && history.index < history.entries.length
        ? redo
        : undefined,
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
