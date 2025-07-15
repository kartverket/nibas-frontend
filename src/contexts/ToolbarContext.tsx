import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchActiveModeToolsFromSessionStorage, fetchActiveToolFromSessionStorage } from "./application-state-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isModeTool = (value: any): value is ModeTool => {
  const allowedValues: ModeTool[] = modeToolValues.slice();
  return allowedValues.includes(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTool = (value: any): value is Tool => {
  const allowedValues: Tool[] = toolValues.slice();
  return allowedValues.includes(value);
};

export const toolValues = [
  "add",
  "remove",
  "draw",
  "split",
  "grenseinfo",
  "grensecoordinates",
  "koordinater",
  "archive",
  "delete",
  "measure",
  "duplicate",
  "historiskeGrenser",
  "merge_grenser",
  null,
] as const;
export type Tool = (typeof toolValues)[number];

const editTools: Tool[] = ["add", "remove", "draw", "split", "koordinater", "archive", "measure", "duplicate"];

export const modeToolValues = [
  "move",
  "matrikkel",
  "snap_nibas",
  "snap_matrikkel",
  "snap_forced",
  "historiskeGrenser",
] as const;
export type ModeTool = (typeof modeToolValues)[number];

export type ToolbarContextValue = {
  activeTool: Tool;
  toggleTool: (tool: Tool) => void;
  resetTool: () => void;

  activeModeTools: ModeTool[];
  toggleModeTool: (modeTool: ModeTool) => void;
  enableModeTool: (modeTool: ModeTool) => void;
  disableModeTool: (modeTool: ModeTool) => void;
  resetModeTools: () => void;
  toggleDefaultSnapModeTools: () => void;
  toggleForcedSnapMode: () => void;
  toggleNibasSnapMode: () => void;
};

export const ToolbarContext = createContext<ToolbarContextValue | undefined>(undefined);

export const ToolbarProvider = ({ children }: { children: React.ReactNode }) => {
  const defaultTool = null;
  const [activeTool, setActiveTool] = useState<Tool>(defaultTool);

  const defaultModeTools: ModeTool[] = ["move", "snap_matrikkel", "snap_nibas"];
  const [activeModeTools, setActiveModeTools] = useState<ModeTool[]>(defaultModeTools);

  useEffect(() => {
    const modeTools = fetchActiveModeToolsFromSessionStorage();
    const tools = fetchActiveToolFromSessionStorage();

    if (tools !== null) {
      setActiveTool(tools);
    }
    if (modeTools !== null) {
      setActiveModeTools(modeTools);
    }
  }, []);

  const toggleTool = (tool: Tool) => {
    if (tool === activeTool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      if (editTools.includes(tool)) {
        disableModeTool("move");
      }
    }
  };

  const toggleModeTool = (modeTool: ModeTool) => {
    if (activeModeTools.includes(modeTool)) {
      setActiveModeTools((prevTools) => prevTools.filter((em) => em !== modeTool));
    } else {
      setActiveModeTools((prevTools) => prevTools.concat(modeTool));
    }
  };

  const enableModeTool = (modeTool: ModeTool) => {
    if (!activeModeTools.includes(modeTool)) {
      setActiveModeTools(activeModeTools.concat(modeTool));
    }
  };

  const disableModeTool = (modeTool: ModeTool) => {
    if (activeModeTools.includes(modeTool)) {
      setActiveModeTools(activeModeTools.filter((em) => em !== modeTool));
    }
  };

  const toggleDefaultSnapModeTools = () => {
    const snapModes: ModeTool[] = ["snap_nibas", "snap_matrikkel"];
    if (activeModeTools.some((mode) => snapModes.includes(mode))) {
      setActiveModeTools(activeModeTools.filter((mode) => !snapModes.includes(mode) && mode !== "snap_forced"));
    } else {
      setActiveModeTools(activeModeTools.concat(snapModes));
    }
  };

  const toggleForcedSnapMode = () => {
    if (activeModeTools.includes("snap_forced")) {
      setActiveModeTools(activeModeTools.filter((mode) => mode !== "snap_forced"));
    } else {
      setActiveModeTools(activeModeTools.concat("snap_forced", "snap_nibas"));
    }
  };

  const toggleNibasSnapMode = () => {
    if (activeModeTools.includes("snap_nibas")) {
      setActiveModeTools(activeModeTools.filter((mode) => mode !== "snap_nibas" && mode !== "snap_forced"));
    } else {
      setActiveModeTools(activeModeTools.concat("snap_nibas"));
    }
  };

  const resetModeTools = () => {
    if (
      activeModeTools.length !== defaultModeTools.length ||
      !defaultModeTools.every((modeTool) => activeModeTools.includes(modeTool))
    ) {
      setActiveModeTools(defaultModeTools);
    }
  };

  const value = {
    activeTool,
    toggleTool,
    activeModeTools,
    toggleModeTool,
    enableModeTool,
    disableModeTool,
    resetTool: () => setActiveTool(defaultTool),
    resetModeTools,
    toggleDefaultSnapModeTools,
    toggleForcedSnapMode,
    toggleNibasSnapMode,
  };

  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>;
};

export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarContext");
  }

  return context;
};
