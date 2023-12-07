import React, { createContext, useContext, useState } from "react";

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
type ModeTool = "move" | "snap" | "matrikkel";

export type ToolbarContextValue = {
  activeTool: Tool;
  toggleTool: (tool: Tool) => void;
  resetTool: () => void;

  activeModeTools: ModeTool[];
  toggleModeTool: (modeTool: ModeTool) => void;
  resetModeTools: () => void;
};

export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined,
);

export const ToolbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const defaultTool = null;
  const [activeTool, setActiveTool] = useState<Tool>(defaultTool);

  const defaultModeTools: ModeTool[] = ["move", "snap"];
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
