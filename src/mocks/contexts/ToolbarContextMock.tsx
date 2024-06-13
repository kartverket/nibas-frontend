import { ToolbarContext } from "contexts/ToolbarContext";
import { ReactNode } from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const ToolbarContextValue = {
  activeTool: vitest.fn(),
  toggleTool: vitest.fn(),
  resetTool: vitest.fn(),
  activeModeTools: vitest.fn(),
  toggleModeTool: vitest.fn(),
  enableModeTool: vitest.fn(),
  disableModeTool: vitest.fn(),
  resetModeTools: vitest.fn(),
};

export const MockToolbarContextProvider = ({ children }: { children: ReactNode }) => {
  return <ToolbarContext.Provider value={ToolbarContextValue as any}>{children}</ToolbarContext.Provider>;
};
