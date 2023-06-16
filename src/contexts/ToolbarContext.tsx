import React, { createContext, useContext, useState } from "react";
import { useHistory } from "./HistoryContext";

type ToolbarEditMode = "snap";
type ToolbarPointMode =
  | null
  | "add"
  | "remove"
  | "split"
  | "detach"
  | "metadata"
  | "koordinater";

export type ToolbarContextValue = {
  activePointMode: ToolbarPointMode;
  togglePointMode: (pointMode: ToolbarPointMode) => void;
  activeEditModes: ToolbarEditMode[];
  toggleEditMode: (editMode: ToolbarEditMode) => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
};

export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined
);

export const ToolbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { history, redo, undo } = useHistory();

  const [activePointMode, setActivePointMode] =
    useState<ToolbarPointMode>(null);
  const [activeEditModes, setActiveEditModes] = useState<ToolbarEditMode[]>([
    "snap",
  ]);

  const togglePointMode = (pointMode: ToolbarPointMode) => {
    if (pointMode === activePointMode) {
      setActivePointMode(null);
    } else {
      setActivePointMode(pointMode);
    }
  };

  const toggleEditMode = (editMode: ToolbarEditMode) => {
    if (activeEditModes.includes(editMode)) {
      setActiveEditModes(activeEditModes.filter((em) => em !== editMode));
    } else {
      setActiveEditModes(activeEditModes.concat(editMode));
    }
  };

  const value = {
    activePointMode,
    togglePointMode,
    activeEditModes,
    toggleEditMode,
    canSave: history.entries.length > 0 && history.index > 0,
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
