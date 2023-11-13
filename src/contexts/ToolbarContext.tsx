import React, { createContext, useContext, useState } from "react";
import { useFeatureStyle } from "./FeatureStyleContext";
import { useHistory } from "./HistoryContext";

type ToolbarEditMode = "snap";
export type ToolbarPointMode =
  | null
  | "add"
  | "remove"
  | "draw"
  | "split"
  | "detach"
  | "metadata"
  | "koordinater"
  | "archive";

export type ToolbarContextValue = {
  activePointMode: ToolbarPointMode;
  togglePointMode: (pointMode: ToolbarPointMode) => void;
  activeEditModes: ToolbarEditMode[];
  toggleEditMode: (editMode: ToolbarEditMode) => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
  canArchive: boolean;
};

export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined,
);

export const ToolbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { history, redo, undo } = useHistory();
  const { selectedFeatures, archivedFeatureIds } = useFeatureStyle();

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
    // TODO: denne lar meg arkivere grenser som allerede er arkiverte dersom jeg har lagret arkiveringen
    canArchive:
      selectedFeatures.length === 0 ||
      archivedFeatureIds.some((id) => id === selectedFeatures[0].getId()),
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
