import React, { createContext, useContext, useState } from "react";
import { useHistory } from "./HistoryContext";

export type Tool =
  | null
  | "add"
  | "remove"
  | "draw"
  | "split"
  | "detach"
  | "metadata"
  | "koordinater"
  | "archive";
type ModeTool = "snap" | "matrikkel";

export type ToolbarContextValue = {
  activeTool: Tool;
  toggleTool: (tool: Tool) => void;
  resetTool: () => void;

  activeModeTools: ModeTool[];
  toggleModeTool: (modeTool: ModeTool) => void;
  resetModeTools: () => void;

  canSave: boolean;
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
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

  const defaultTool = null;
  const [activeTool, setActiveTool] = useState<Tool>(defaultTool);

  const defaultModeTools: ModeTool[] = ["snap"];
  const [activeModeTools, setActiveModeTools] =
    useState<ModeTool[]>(defaultModeTools);

  const toggleTool = (tool: Tool) => {
    if (tool === activeTool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
    }
  };

  const toggleModeTool = (modeTool: ModeTool) => {
    if (activeModeTools.includes(modeTool)) {
      setActiveModeTools(activeModeTools.filter((em) => em !== modeTool));
    } else {
      setActiveModeTools(activeModeTools.concat(modeTool));
    }
  };

  const value = {
    activeTool,
    toggleTool,
    activeModeTools,
    toggleModeTool,
    resetTool: () => setActiveTool(defaultTool),
    resetModeTools: () => setActiveModeTools(defaultModeTools),
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
