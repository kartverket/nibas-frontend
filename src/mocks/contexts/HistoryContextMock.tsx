import { HistoryContext } from "contexts/HistoryContext/HistoryContext";
import { ReactNode } from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */

const mockHistoryContextValue = {
  addHistoryEntry: vitest.fn(),
  history: {} as any,
  clearHistory: vitest.fn(),
  getHistoryEntries: vitest.fn(),
  canSave: false,
  undo: vitest.fn(),
  redo: vitest.fn(),
  reapplyCurrentEntries: vitest.fn(),
};

const MockHistoryProvider = ({ children }: { children: ReactNode }) => {
  return <HistoryContext.Provider value={mockHistoryContextValue as any}>{children}</HistoryContext.Provider>;
};

export { MockHistoryProvider };
